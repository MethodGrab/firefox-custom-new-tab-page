// flags
const log = false;


// globals
const extensionNewTabPath = 'app.html';

// TODO: this also exists in options.js and could be moved to a separate helper file
const forceOpenInTopFramePermissions = [
	'webRequest',
	'webRequestBlocking',
];


// state
let options = {
	customNewTabUrl: '',
	forceOpenInTopFrame: false,
};


// Firefox API helpers

// TODO: this also exists in options.js and could be moved to a separate helper file
const toMatchPattern = urlStr => {
	try {
		// Match patterns without paths must have a trailing slash.
		// URL.toString adds a trailing slash when needed, e.g.
		// new URL( 'https://example.org' ).toString() // -> 'https://example.org/'
		return new URL( urlStr ).toString();
	} catch ( err ) {
		console.error( '#toMatchPattern', err );
		return false;
	}
};


const updateOptionsCache = opts => { options = Object.assign( {}, options, opts ); };

const refreshOptionsCache = async _ => await browser.storage.sync.get([ 'customNewTabUrl', 'forceOpenInTopFrame' ]).then( updateOptionsCache );

const customNewTabUrlExists = _ => ( options.customNewTabUrl && options.customNewTabUrl.length !== 0 );

const applyFilter = details => {
	log && console.debug( '#applyFilter', options, details );

	if ( !options.forceOpenInTopFrame ) {
		// Dont modify requests if the option is not enabled.
		log && console.debug( '#applyFilter // forceOpenInTopFrame option not enabled... skipping' );
		return false;
	}

	if ( details.originUrl !== browser.extension.getURL( extensionNewTabPath ) ) {
		// Don't modify requests outside of the extension new tab page.
		// This is still needed because the `customNewTabUrl` scope used in the onBeforeRequest listener doesnt guarantee the request is coming from this extension.
		log && console.debug( '#applyFilter // outside of extension new tab page... skipping' );
		return false;
	}

	log && console.debug( '#applyFilter // modifying', { url: details.url, originUrl: details.originUrl } );

	const decoder = new TextDecoder( 'utf-8' );
	const encoder = new TextEncoder();
	const filter = browser.webRequest.filterResponseData( details.requestId );

	// This only modifies `details.url` which is `options.customNewTabUrl`.
	// The extension page, `details.originUrl`, is not changed.
	filter.ondata = event => {
		let str = decoder.decode( event.data, { stream: true } );
		// insert the <base> tag just before the closing </head>
		str = str.replace( /<\/head>/g, '<base target="_top">\n</head>' );

		filter.write( encoder.encode( str ) );
		filter.disconnect();
	};

	return true;
};


const listener = async details => {
	try {
		return applyFilter( details );
	} catch ( err ) {
		console.error( '#listener', err );
		return false;
	}
};


const removeRequestListener = _ => {
	const hasListener = browser.webRequest.onBeforeRequest.hasListener( listener );
	log && console.debug( '#removeRequestListener', { hasListener } );

	if ( hasListener ) {
		browser.webRequest.onBeforeRequest.removeListener( listener );
	}
};

const addRequestListener = _ => {
	log && console.debug( '#addRequestListener' );

	if ( !customNewTabUrlExists() ) {
		return false;
	}

	const customNewTabUrlMatchPattern = toMatchPattern( options.customNewTabUrl );
	log && console.debug( '#addRequestListener', { customNewTabUrlMatchPattern } );

	if ( !customNewTabUrlMatchPattern ) {
		return false;
	}

	// clean up old listeners
	removeRequestListener();

	browser.webRequest.onBeforeRequest.addListener(
		listener,
		{
			urls: [
				browser.extension.getURL( extensionNewTabPath ),
				customNewTabUrlMatchPattern,
			],
			types: [ 'sub_frame' ],
		},
		[ 'blocking' ],
	);

	return true;
};


const hasPermissions = async _ => {
	try {
		const requiredPermissions = {
			permissions:  forceOpenInTopFramePermissions,
			origins: [ toMatchPattern( options.customNewTabUrl ) ],
		};

		const hasPermissions_ = await browser.permissions.contains( requiredPermissions );
		log && console.debug( '#hasPermissions', { requiredPermissions, hasPermissions_ } );

		return hasPermissions_;
	} catch ( err ) {
		console.error( '#hasPermissions // error', err );
		return false;
	}
};


const init = async _ => {
	try {
		log && console.debug( '#init' );

		await refreshOptionsCache();
		log && console.debug( '#init // got options', options );

		if ( options.forceOpenInTopFrame && customNewTabUrlExists() && await hasPermissions() ) {
			log && console.debug( '#init // has permissions, url exists, option set -- adding request listener' );
			addRequestListener();
		} else {
			log && console.debug( '#init // either no permissions OR no url OR option is disabled -- do nothing' );
		}
	} catch ( err ) {
		console.error( '#init', err );
	}
};


const addOptionsListener = _ => {
	log && console.debug( '#addOptionsListener' );
	return browser.storage.onChanged.addListener( _ => {
		log && console.debug( 'storage.onChanged' );
		init();
	});
};


// this listener should only be added once so it's separate from init
addOptionsListener();

init();
