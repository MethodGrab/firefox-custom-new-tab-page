const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
	});
};

const restoreOptions = _ => {
	const gettingItem = browser.storage.sync.get( ['customNewTabUrl', 'customNewTabTitle'] );

	gettingItem.then( res => {
		document.getElementById( 'customNewTabUrl' ).value = res.customNewTabUrl || '';
		document.getElementById( 'customNewTabTitle' ).value = res.customNewTabTitle || '';
	});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
