const self    = require( 'sdk/self' );
const pageMod = require( 'sdk/page-mod' );
const tabs    = require( 'sdk/tabs' );
const sp      = require( 'sdk/simple-prefs' );

const NEW_TAB_URL = 'about:newtab';


pageMod.PageMod({
	include           : [ NEW_TAB_URL ],
	contentScriptFile : './app.js',
	contentStyleFile  : './app.css',
	onAttach( worker ) {
		worker.port.emit( 'showCustomPage', sp.prefs.customNewTabUrl );
	},
});


// Listen for tab openings
tabs.on( 'open', function onOpen( tab ) {
	if ( tab.url === NEW_TAB_URL ) {
		// redirect so pageMod can intercept
		tab.url = NEW_TAB_URL;
	}
});
