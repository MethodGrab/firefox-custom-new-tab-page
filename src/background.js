// flags
const log = false;


// globals
const extensionNewTabPath = 'app.html';

// TODO: this also exists in options.js and could be moved to a separate helper file.
const removeIframeHeadersPermissions = [
	'webRequest',
	'webRequestBlocking',
];

// TODO: this also exists in options.js and could be moved to a separate helper file.
const forceOpenInTopFramePermissions = [
	'webRequest',
	'webRequestBlocking',
];


// state
let options = {
	customNewTabUrl: '',
	removeIframeHeaders: false,
	forceOpenInTopFrame: false,
};


// Firefox API helpers

// TODO: this also exists in options.js and could be moved to a separate helper file.
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

// TODO: this also exists in options.js and could be moved to a separate helper file.
// Creates a matcher for any page on a given domain.
// toWildcardDomainMatchPattern('https://example.com') // -> 'https://*.example.com/*'
// toWildcardDomainMatchPattern('https://example.com:3000/foo/bar.html') // -> 'https://*.example.com:3000/*'
const toWildcardDomainMatchPattern = urlStr => {
	try {
		const url = new URL( urlStr );
		const pattern = `${url.protocol}//*.${url.host}/*`;

		log && console.debug( '#toWildcardDomainMatchPattern', { pattern } );
		return pattern;
	} catch ( err ) {
		console.error( '#toWildcardDomainMatchPattern', err );
		return false;
	}
};


const updateOptionsCache = opts => { options = Object.assign( {}, options, opts ); };

const refreshOptionsCache = async _ =>
	await browser.storage.sync.get([
		'customNewTabUrl',
		'removeIframeHeaders',
		'forceOpenInTopFrame',
	]).then( updateOptionsCache );

const customNewTabUrlExists = _ => ( options.customNewTabUrl && options.customNewTabUrl.length !== 0 );


const forceOpenInTopFrameFilter = details => {
	log && console.debug( '#forceOpenInTopFrameFilter', options, details );

	if ( !options.forceOpenInTopFrame ) {
		// Dont modify requests if the option is not enabled.
		log && console.debug( '#forceOpenInTopFrameFilter // forceOpenInTopFrame option not enabled... skipping' );
		return false;
	}

	if ( details.originUrl !== browser.extension.getURL( extensionNewTabPath ) ) {
		// Don't modify requests outside of the extension new tab page.
		// This is still needed because the `customNewTabUrl` scope used in the onBeforeRequest listener doesnt guarantee the request is coming from this extension.
		log && console.debug( '#forceOpenInTopFrameFilter // outside of extension new tab page... skipping' );
		return false;
	}

	log && console.debug( '#forceOpenInTopFrameFilter // modifying', { url: details.url, originUrl: details.originUrl } );

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

const removeIframeHeadersFilter = details => {
	log && console.debug( '#removeIframeHeadersFilter', options, details );

	if ( !options.removeIframeHeaders ) {
		// Dont modify requests if the option is not enabled.
		log && console.debug( '#removeIframeHeadersFilter // removeIframeHeaders option not enabled... skipping' );
		return false;
	}

	if ( details.originUrl !== browser.extension.getURL( extensionNewTabPath ) ) {
		// Don't modify requests outside of the extension new tab page.
		// This is still needed because the `customNewTabUrl` scope used in the onHeadersReceived listener doesnt guarantee the request is coming from this extension.
		log && console.debug( '#removeIframeHeadersFilter // outside of extension new tab page... skipping' );
		return false;
	}

	log && console.debug( '#removeIframeHeadersFilter // modifying', { url: details.url, originUrl: details.originUrl } );

	const responseHeaders = details.responseHeaders.filter(header => {
		return header.name.toLowerCase() !== 'x-frame-options';
	});

	log && console.debug( '#removeIframeHeadersFilter // new response headers', responseHeaders );

	// NOTE: changes made here will **not** show up in the browser DevTools network tab.
	return { responseHeaders };
};


const onBeforeRequestListener = async details => {
	try {
		return forceOpenInTopFrameFilter( details );
	} catch ( err ) {
		console.error( '#onBeforeRequestListener', err );
		return false;
	}
};


const onBeforeRequestListenerCleanup = _ => {
	const hasListener = browser.webRequest.onBeforeRequest.hasListener( onBeforeRequestListener );
	log && console.debug( '#onBeforeRequestListenerCleanup', { hasListener } );

	if ( hasListener ) {
		browser.webRequest.onBeforeRequest.removeListener( onBeforeRequestListener );
	}
};

const onHeadersReceivedListener = async details => {
	try {
		return removeIframeHeadersFilter( details );
	} catch ( err ) {
		console.error( '#onHeadersReceivedListener', err );
		return false;
	}
};


const onHeadersReceivedListenerCleanup = _ => {
	const hasListener = browser.webRequest.onHeadersReceived.hasListener( onHeadersReceivedListener );
	log && console.debug( '#onHeadersReceivedListenerCleanup', { hasListener } );

	if ( hasListener ) {
		browser.webRequest.onHeadersReceived.removeListener( onHeadersReceivedListener );
	}
};

const addRequestListener = _ => {
	log && console.debug( '#addRequestListener' );

	if ( !customNewTabUrlExists() ) {
		return false;
	}

	// TODO: this logic is duplicated in options.js and should be centralized somewhere.
	const forceOpenInTopFrameCustomNewTabUrlMatchPattern = toMatchPattern( options.customNewTabUrl );
	log && console.debug( '#addRequestListener', { forceOpenInTopFrameCustomNewTabUrlMatchPattern } );

	onBeforeRequestListenerCleanup();

	if ( forceOpenInTopFrameCustomNewTabUrlMatchPattern ) {
		browser.webRequest.onBeforeRequest.addListener(
			onBeforeRequestListener,
			{
				urls: [
					browser.extension.getURL( extensionNewTabPath ),
					forceOpenInTopFrameCustomNewTabUrlMatchPattern,
				],
				types: [ 'sub_frame' ],
			},
			[ 'blocking' ],
		);
	}

	// TODO: this logic is duplicated in options.js and should be centralized somewhere.
	const removeIframeHeadersCustomNewTabUrlMatchPattern = toWildcardDomainMatchPattern( options.customNewTabUrl );
	log && console.debug( '#addRequestListener', { removeIframeHeadersCustomNewTabUrlMatchPattern } );

	onHeadersReceivedListenerCleanup();

	if ( removeIframeHeadersCustomNewTabUrlMatchPattern ) {
		browser.webRequest.onHeadersReceived.addListener(
			onHeadersReceivedListener,
			{
				urls: [
					browser.extension.getURL( extensionNewTabPath ),
					removeIframeHeadersCustomNewTabUrlMatchPattern,
				],
				types: [ 'sub_frame' ],
			},
			[ 'blocking', 'responseHeaders' ],
		);
	}

	return true;
};


// TODO: this logic is duplicated in options.js and should be centralized somewhere.
const hasPermissions = async _ => {
	try {
		let permissions = [];
		let origins = [];

		if ( options.removeIframeHeaders ) {
			permissions = permissions.concat( removeIframeHeadersPermissions );
			origins = origins.concat( toWildcardDomainMatchPattern( options.customNewTabUrl ) );
		}

		if ( options.forceOpenInTopFrame ) {
			permissions = permissions.concat( forceOpenInTopFramePermissions );
			origins = origins.concat( toMatchPattern( options.customNewTabUrl ) );
		}

		const requiredPermissions = {
			permissions,
			origins,
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

		if ( (options.removeIframeHeaders || options.forceOpenInTopFrame) && customNewTabUrlExists() && await hasPermissions() ) {
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
