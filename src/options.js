const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.querySelector( '#customNewTabUrl' ).value,
	});
};

const restoreOptions = _ => {
	const gettingItem = browser.storage.sync.get( 'customNewTabUrl' );

	gettingItem.then( res => {
		document.querySelector( '#customNewTabUrl' ).value = res.customNewTabUrl || '';
	});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
