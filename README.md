# Custom New Tab Page
> A Firefox extension that allows you to specify a custom URL to be shown when opening a new tab, _without changing the address bar content_.


## Usage
To set your custom new tab url:
1. Open `Add-ons` from the `Menu (☰)` (or navigate to `about:addons` with the address bar)
1. Select `Extensions`
1. Select the `Custom New Tab Page` extension → `Options`
1. Enter your URL in the `New Tab URL` box
1. Press `Save`
1. Done!


## Development

Testing unsigned extensions only works with [non-release builds](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext#Testing_unsigned_extensions), to develop the extension:
1. Install a [non-release build](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext#Testing_unsigned_extensions) (e.g. Firefox Developer Edition)
1. `npm run start` to load Firefox Developer Edition with the extension installed + watch for changes and reload the extension automatically

**Note: `npm run start` assumes you're on Windows with Firefox Developer Edition installed in the default directory. If not, modify the `start` script path in `package.json` as needed.**


## Release Process

After making changes to the extension, do the following to publish a new version:

1. `npm run test`
1. Bump the `version` in `src/manifest.json`
1. Commit with the version number as the commit message (e.g. `1.0.0`) and tag the commit with the version number (e.g. `v1.0.0`)
1. `npm run package` to bundle the `xpi` file
1. Upload the generated `xpi` to https://addons.mozilla.org/en-US/developers/addons
