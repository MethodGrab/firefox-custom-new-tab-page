const hiddenClass = 'is-hidden';

const updateCustomBackgroundColorVisibility = _ => {
	const theme = document.getElementById( 'theme' ).value;

	if ( theme === 'custom' ) {
		document.getElementById( 'customBackgroundColor' ).classList.remove( hiddenClass );
	} else {
		document.getElementById( 'customBackgroundColor' ).classList.add( hiddenClass );
	}
};

const saveOptions = e => {
	e.preventDefault();

	browser.storage.sync.set({
		customNewTabUrl: document.getElementById( 'customNewTabUrl' ).value,
		customNewTabTitle: document.getElementById( 'customNewTabTitle' ).value,
		theme: document.getElementById( 'theme' ).value,
		customBackgroundColor: document.getElementById( 'customBackgroundColor' ).value,
	});
};

const restoreOptions = _ => {
	browser.storage.sync.get([ 'customNewTabUrl', 'customNewTabTitle', 'theme', 'customBackgroundColor' ])
		.then( options => {
			document.getElementById( 'customNewTabUrl' ).value = options.customNewTabUrl || '';
			document.getElementById( 'customNewTabTitle' ).value = options.customNewTabTitle || '';
			document.getElementById( 'theme' ).value = options.theme || 'none';
			document.getElementById( 'customBackgroundColor' ).value = options.customBackgroundColor || '';

			updateCustomBackgroundColorVisibility();
		});
};

document.addEventListener( 'DOMContentLoaded', restoreOptions );
document.querySelector( 'form' ).addEventListener( 'submit', saveOptions );
document.getElementById( 'theme' ).addEventListener( 'change', updateCustomBackgroundColorVisibility );
