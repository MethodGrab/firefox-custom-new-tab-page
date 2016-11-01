const showCustomPage = customNewTabUrl => {
	console.debug( '[showCustomPage] init', { customNewTabUrl } );

	// no tab URL set, do nothing
	if ( !customNewTabUrl || !customNewTabUrl.length ) {
		console.debug( '[showCustomPage] no tab url set' );
		return false;
	}

	document.querySelector( 'html' ).classList.add( 'cntp-has-loaded' );

	// The `type="content"` attribute is used for security purposes to avoid
	// giving the iframe a privileged context that could be used to
	// access browser (cookies, history, etc) or user files.
	// See https://mdn.io/Displaying_web_content_in_an_extension_without_security_issues
	const iframe = document.createElement( 'iframe' );
	iframe.setAttribute( 'type', 'content' );
	iframe.className = 'cntp__iframe';
	iframe.src       = customNewTabUrl;

	document.body.textContent = '';
	document.body.appendChild( iframe );

	return true;
};

self.port.on( 'showCustomPage', showCustomPage );
