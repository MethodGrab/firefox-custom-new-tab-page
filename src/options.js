const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
		theme: document.getElementById( 'theme' ).value,
	});
};

const restoreOptions = _ => {
	browser.storage.sync.get([ 'customNewTabUrl', 'customNewTabTitle', 'theme' ])
		.then( options => {
			document.getElementById( 'customNewTabUrl' ).value = options.customNewTabUrl || '';
			document.getElementById( 'customNewTabTitle' ).value = options.customNewTabTitle || '';
			document.getElementById( 'theme' ).value = options.theme || 'transparent';
		});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
