# Custom New Tab Page

[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/MethodGrab/firefox-custom-new-tab-page/CI.yaml?branch=master&style=flat-square)](https://github.com/MethodGrab/firefox-custom-new-tab-page/actions/workflows/CI.yaml)
[![Version](https://img.shields.io/amo/v/custom-new-tab-page?style=flat-square)][amo]
[![Rating](https://img.shields.io/amo/rating/custom-new-tab-page?style=flat-square)][amo]
[![Users](https://img.shields.io/amo/users/custom-new-tab-page?style=flat-square)][amo]
[![Downloads](https://img.shields.io/amo/dw/custom-new-tab-page?style=flat-square)][amo]

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

Testing unsigned extensions only works with [non-release builds](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext#Testing_unsigned_extensions) of Firefox, to develop the extension:
1. Install a [non-release build](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Getting_started_with_web-ext#Testing_unsigned_extensions) (e.g. Firefox Developer Edition)
1. `npm install`
1. `npm run start` to load Firefox Developer Edition with the extension installed. Making changes to the code will automatically reload the extension.


## Release Process

To publish a new version:

1. `npm run validate`
1. Bump the `version` in `src/manifest.json`
1. Commit with the version number as the commit message (e.g. `:bookmark: 1.0.0`) and tag the commit with the version number (e.g. `v1.0.0`)
1. `npm run package` to bundle the extension as a `zip` file
1. Upload the generated `zip` to https://addons.mozilla.org/en-US/developers/addons


[amo]: https://addons.mozilla.org/en-GB/firefox/addon/custom-new-tab-page
