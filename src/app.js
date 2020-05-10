const log = false;

const showCustomPage = opts => {
	log && console.debug( '[showCustomPage] init', opts );

	if ( opts.theme === 'light' ) {
		document.body.classList.add( 't-light' );
	}

	if ( opts.theme === 'dark' ) {
		document.body.classList.add( 't-dark' );
	}

	if ( opts.theme === 'custom' && opts.customBackgroundColor && opts.customBackgroundColor.length !== 0 ) {
		document.body.style.backgroundColor = opts.customBackgroundColor;
	}

	if ( opts.customNewTabTitle ) {
		document.title = opts.customNewTabTitle;
	}

	// no tab URL set, do nothing
	if ( !opts.customNewTabUrl || opts.customNewTabUrl.length === 0 ) {
		log && console.debug( '[showCustomPage] no tab url set' );
		return;
	}

	document.documentElement.classList.add( 'cntp-has-loaded' );

	const onload = _ => document.body.classList.remove( 'is-loading' );
	const iframe = document.getElementById( 'cntp-iframe' );
	iframe.onload = onload;
	iframe.src = opts.customNewTabUrl;
};

const init = _ => {
	browser.storage.sync.get([ 'customNewTabUrl', 'customNewTabTitle', 'theme', 'customBackgroundColor' ])
		.then( showCustomPage );
};

init();
