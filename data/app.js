const showCustomPage = customNewTabUrl => {
	console.debug( '[showCustomPage] init', { customNewTabUrl } );

	// no tab URL set, do nothing
	if ( !customNewTabUrl || !customNewTabUrl.length ) {
		console.debug( '[showCustomPage] no tab url set' );
		return false;
	}

	document.querySelector( 'html' ).classList.add( 'cntp-has-loaded' );

	const content = `<iframe class="cntp__iframe" src="${customNewTabUrl}"></iframe>`;
	document.body.innerHTML = content;

	return true;
};

self.port.on( 'showCustomPage', showCustomPage );
