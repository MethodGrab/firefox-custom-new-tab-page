// flags
const log = false;


// globals
const hiddenClass = 'is-hidden';


// Firefox API helpers
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

class PermissionSet {
	constructor(permissions, origins) {
		this.permissions = permissions;
		this.origins = origins;
	}

	get() {
		return {
			permissions: this.permissions,
			origins: this.origins,
		};
	}

	async granted() {
		return await browser.permissions.contains( this.get() );
	}
}


// option: removeIframeHeaders
const getRemoveIframeHeadersValue = _ => {
	const value = document.getElementById( 'removeIframeHeaders' ).checked;
	log && console.debug( '#getRemoveIframeHeadersValue', value );

	return value;
};


const setRemoveIframeHeadersValue = value => {
	log && console.debug( '#setRemoveIframeHeadersValue', value );
	document.getElementById( 'removeIframeHeaders' ).checked = value;
};

// :: PermissionSet|null
const removeIframeHeadersPermissions = _ => {
	const customNewTabUrl = document.getElementById( 'customNewTabUrl' ).value;

	if ( customNewTabUrl && getRemoveIframeHeadersValue() ) {
		const matchPattern = toWildcardDomainMatchPattern( customNewTabUrl );

		log && console.debug( '#removeIframeHeadersPermissions', { matchPattern } );

		if ( !matchPattern ) {
			// TODO: if the URL is not valid for removeIframeHeaders the option should be disabled with a note explaining why!
			return null;
		}

		const permissionSet = new PermissionSet(
			[
				'webRequest',
				'webRequestBlocking',
			],
			[ matchPattern ],
		);

		log && console.debug( '#removeIframeHeadersPermissions', permissionSet.get() );

		return permissionSet;
	}

	return null;
};


// option: forceOpenInTopFrame
const getForceOpenInTopFrameValue = _ => {
	const value = document.getElementById( 'forceOpenInTopFrame' ).checked;
	log && console.debug( '#getForceOpenInTopFrameValue', value );

	return value;
};


const setForceOpenInTopFrameValue = value => {
	log && console.debug( '#setForceOpenInTopFrameValue', value );
	document.getElementById( 'forceOpenInTopFrame' ).checked = value;
};


// :: PermissionSet|null
const forceOpenInTopFramePermissions = _ => {
	const customNewTabUrl = document.getElementById( 'customNewTabUrl' ).value;

	if ( customNewTabUrl && getForceOpenInTopFrameValue() ) {
		const matchPattern = toMatchPattern( customNewTabUrl );

		log && console.debug( '#forceOpenInTopFramePermissions', { matchPattern } );

		if ( !matchPattern ) {
			// TODO: if the URL is not valid for forceOpenInTopFrame the option should be disabled with a note explaining why!
			return null;
		}

		const permissionSet = new PermissionSet(
			[
				'webRequest',
				'webRequestBlocking',
			],
			[ matchPattern ],
		);

		log && console.debug( '#forceOpenInTopFramePermissions', permissionSet.get() );

		return permissionSet;
	}

	return null;
};


// option: theme
const updateCustomBackgroundColorVisibility = _ => {
	const theme = document.getElementById( 'theme' ).value;

	if ( theme === 'custom' ) {
		document.getElementById( 'customBackgroundColor' ).classList.remove( hiddenClass );
	} else {
		document.getElementById( 'customBackgroundColor' ).classList.add( hiddenClass );
	}
};


// permissions
const requiredPermissions = _ => {
	const permissionsToRequest = [
		removeIframeHeadersPermissions(),
		forceOpenInTopFramePermissions(),
	]
		.filter(r => r instanceof PermissionSet)
		.reduce(
			(acc, permissionSet) => {
				const { permissions, origins } = permissionSet.get();
				return {
					permissions: acc.permissions.concat(permissions),
					origins: acc.origins.concat(origins),
				};
			},
			{ permissions: [], origins: [] },
		);

	log && console.debug( '#requiredPermissions', { permissionsToRequest } );
	return permissionsToRequest;
};

const requestPermissions = async _ => {
	const permissionsToRequest = requiredPermissions();
	let permissionsGranted = false;
	log && console.debug( '#requestPermissions', { permissionsToRequest } );

	try {
		permissionsGranted = await browser.permissions.request( permissionsToRequest );
	} catch ( err ) {
		console.error( '#requestPermissions // request permissions failed', err );
	}

	log && console.debug( '#requestPermissions', { permissionsGranted } );

	return permissionsGranted;
};

const revokeUnusedPermissions = async _ => {
	// TODO: not implemented
	log && console.debug( '#revokeUnusedPermissions (NOT IMPLEMENTED)' );
	return null;
};

const checkPermissions = async _ => {
	const removeIframeHeadersPermissions_ = removeIframeHeadersPermissions();

	if ( !removeIframeHeadersPermissions_ || ( removeIframeHeadersPermissions_ && !( await removeIframeHeadersPermissions_.granted() ) ) ) {
		log && console.debug( '#checkPermissions // removeIframeHeaders permissions not found... unchecking option' );
		setRemoveIframeHeadersValue( false );
	}

	const forceOpenInTopFramePermissions_ = forceOpenInTopFramePermissions();

	if ( !forceOpenInTopFramePermissions_ || ( forceOpenInTopFramePermissions_ && !( await forceOpenInTopFramePermissions_.granted() ) ) ) {
		log && console.debug( '#checkPermissions // forceOpenInTopFrame permissions not found... unchecking option' );
		setForceOpenInTopFrameValue( false );
	}

	return null;
};

const refreshPermissions = async _ => {
	await revokeUnusedPermissions();
	await requestPermissions();
	await checkPermissions();
};


// general form
const saveOptions = async e => {
	e.preventDefault();

	const options = {
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
		theme: document.getElementById( 'theme' ).value,
		customBackgroundColor: document.getElementById( 'customBackgroundColor' ).value,
		removeIframeHeaders: getRemoveIframeHeadersValue(),
		forceOpenInTopFrame: getForceOpenInTopFrameValue(),
	};

	log && console.debug( '#saveOptions', options );

	await browser.storage.sync.set( options );
};


const restoreOptions = async _ => {
	const options = await browser.storage.sync.get([
		'customNewTabUrl',
		'customNewTabTitle',
		'theme',
		'customBackgroundColor',
		'removeIframeHeaders',
		'forceOpenInTopFrame',
	]);

	log && console.debug( '#restoreOptions', options );

	document.getElementById( 'customNewTabUrl' ).value = options.customNewTabUrl || '';
	document.getElementById( 'customNewTabTitle' ).value = options.customNewTabTitle || '';
	document.getElementById( 'theme' ).value = options.theme || 'none';
	document.getElementById( 'customBackgroundColor' ).value = options.customBackgroundColor || '';

	setRemoveIframeHeadersValue( typeof options.removeIframeHeaders === 'undefined' ? false : options.removeIframeHeaders );
	setForceOpenInTopFrameValue( typeof options.forceOpenInTopFrame === 'undefined' ? false : options.forceOpenInTopFrame );

	updateCustomBackgroundColorVisibility();

	// TODO: requesting permissions can only be done from a user event handler (e.g. click).
	// We can either assume the correct permissions have been granted,
	// or check and show a button to request them (or just change the forceOpenInTopFrame to false) if they have not been granted.
};


// event listeners
document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );

// this blur will fail with `permissions.request may only be called from a user input handler` if the input is programatically blurred (e.g. by changing tab while focused on the input) but thats ok.
document.getElementById( 'customNewTabUrl' ).addEventListener( 'blur', refreshPermissions );

document.getElementById( 'theme' ).addEventListener( 'change', updateCustomBackgroundColorVisibility );
document.getElementById( 'removeIframeHeaders' ).addEventListener( 'change', refreshPermissions );
document.getElementById( 'forceOpenInTopFrame' ).addEventListener( 'change', refreshPermissions );
