const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
	});
};

const restoreOptions = _ => {
	const gettingItem = browser.storage.sync.get( 'customNewTabUrl' );

	gettingItem.then( res => {
		document.getElementById( 'customNewTabUrl' ).value = res.customNewTabUrl || '';
	});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
