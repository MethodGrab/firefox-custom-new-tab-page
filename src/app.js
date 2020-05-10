const log = false;

const showCustomPage = ({ customNewTabUrl, customNewTabTitle, theme }) => {
	log && console.debug( '[showCustomPage] init', { customNewTabUrl, customNewTabTitle, theme } );

	if ( theme ) {
		document.body.backgroundColor = theme;
	}

	if ( customNewTabTitle ) {
		document.title = customNewTabTitle;
	}

	// no tab URL set, do nothing
	if ( !customNewTabUrl || customNewTabUrl.length === 0 ) {
		log && console.debug( '[showCustomPage] no tab url set' );
		return;
	}

	document.documentElement.classList.add( 'cntp-has-loaded' );

	const onload = _ => document.body.classList.remove( 'is-loading' );
	const iframe = document.getElementById( 'cntp-iframe' );
	if ( theme ) { iframe.body.style.backgroundColor = theme; }
	iframe.onload = onload;
	iframe.src = customNewTabUrl;
};

const init = _ => {
	browser.storage.sync.get([ 'customNewTabUrl', 'customNewTabTitle', 'theme' ])
		.then( showCustomPage );
};

init();
