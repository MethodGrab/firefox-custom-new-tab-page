const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
	});
};

const restoreOptions = _ => {
	browser.storage.sync.get([ 'customNewTabUrl', 'customNewTabTitle' ])
		.then( options => {
			document.getElementById( 'customNewTabUrl' ).value = options.customNewTabUrl || '';
			document.getElementById( 'customNewTabTitle' ).value = options.customNewTabTitle || '';
		});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
