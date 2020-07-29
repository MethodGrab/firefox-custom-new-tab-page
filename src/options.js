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


const forceOpenInTopFramePermissions = [
	'webRequest',
	'webRequestBlocking',
];


const revokeForceOpenInTopFramePermissions = async _ => {
	const revokedSuccessfully = await browser.permissions.remove({ permissions: forceOpenInTopFramePermissions });
	log && console.debug( '#revokeForceOpenInTopFramePermissions', { revokedSuccessfully } );

	return revokedSuccessfully;
};


const requestForceOpenInTopFramePermissions = async _ => {
	const customNewTabUrl = document.getElementById( 'customNewTabUrl' ).value;
	const matchPattern = toMatchPattern( customNewTabUrl );

	log && console.debug( '#requestForceOpenInTopFramePermissions', { matchPattern } );

	if ( !matchPattern ) {
		// TODO: if the URL is not valid for forceOpenInTopFrame the option should be disabled with a note explaining why!
		return false;
	}

	const permissionsToRequest = {
		permissions: forceOpenInTopFramePermissions,
		origins: [ matchPattern ],
	};

	let permissionsGranted = false;

	try {
		permissionsGranted = await browser.permissions.request( permissionsToRequest );
	} catch ( err ) {
		console.error( '#requestForceOpenInTopFramePermissions // request permissions failed', err );
	}

	log && console.debug( '#requestForceOpenInTopFramePermissions', permissionsToRequest, { permissionsGranted } );

	return permissionsGranted;
};


const maybeRequestForceOpenInTopFramePermissions = async _ => {
	const customNewTabUrl = document.getElementById( 'customNewTabUrl' ).value;

	if ( customNewTabUrl && getForceOpenInTopFrameValue() ) {
		const permissionsGranted = await requestForceOpenInTopFramePermissions();

		if ( !permissionsGranted ) {
			setForceOpenInTopFrameValue( false );
		}
	}

	return null;
};


const forceOpenInTopFrameChanged = async _ => {
	const forceOpenInTopFrameEnabled = getForceOpenInTopFrameValue();
	log && console.debug( '#forceOpenInTopFrameChanged', { forceOpenInTopFrameEnabled } );

	if ( forceOpenInTopFrameEnabled ) {
		const permissionsGranted = await requestForceOpenInTopFramePermissions();
		log && console.debug( '#forceOpenInTopFrameChanged', { permissionsGranted } );

		if ( !permissionsGranted ) {
			setForceOpenInTopFrameValue( false );
		}
	} else {
		revokeForceOpenInTopFramePermissions();
	}
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


// general form
const saveOptions = async e => {
	e.preventDefault();

	const options = {
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
		theme: document.getElementById( 'theme' ).value,
		customBackgroundColor: document.getElementById( 'customBackgroundColor' ).value,
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
		'forceOpenInTopFrame',
	]);

	log && console.debug( '#restoreOptions', options );

	document.getElementById( 'customNewTabUrl' ).value = options.customNewTabUrl || '';
	document.getElementById( 'customNewTabTitle' ).value = options.customNewTabTitle || '';
	document.getElementById( 'theme' ).value = options.theme || 'none';
	document.getElementById( 'customBackgroundColor' ).value = options.customBackgroundColor || '';

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
document.getElementById( 'customNewTabUrl' ).addEventListener( 'blur', maybeRequestForceOpenInTopFramePermissions );

document.getElementById( 'theme' ).addEventListener( 'change', updateCustomBackgroundColorVisibility );
document.getElementById( 'forceOpenInTopFrame' ).addEventListener( 'change', forceOpenInTopFrameChanged );
