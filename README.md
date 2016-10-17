# Custom New Tab Page
> A Firefox extension that allows you to specify a custom URL to be shown when opening a new tab, _without changing the address bar content_.


## Usage
To set your custom new tab url:
- Open `about:addons`
- Select `Extensions`
- Select the `Custom New Tab Page` extension → `Options`
- Enter your URL in the `New Tab URL` box
- Done!


## Development

Testing unsigned extensions only works with [non-release](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Install_a_different_version_of_Firefox) [builds](https://wiki.mozilla.org/Add-ons/Extension_Signing). To install the unsigned extension:

- Open Firefox Developer Edition
- Install the [Extension Auto-Installer](https://addons.mozilla.org/en-US/firefox/addon/autoinstaller) add-on
- Open `about:config`
- set `xpinstall.signatures.required` to `false`
- Close Firefox Developer Edition
- `npm run start` to load Firefox Developer Edition with the extension installed
- `npm run watch` to watch for changes and [reload the extension automatically](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/jpm#Developing_without_browser_restarts)

**Note: These `npm` commands assume you're on Windows with Firefox Developer Edition installed, modify the paths as needed.**


### Logging
To show [log messages](https://developer.mozilla.org/en-US/Add-ons/SDK/Tools/console#Logging_Levels) during development:
- Open `about:config`
- Create a new string value called `extensions.custom-new-tab-page@mint.as.sdk.console.logLevel` with a value of `all`


## Release Process

After making changes to the extension, do the following to publish a new version:

1. `npm run package` to bundle the `xpi` file
1. Upload the generated `xpi` to https://addons.mozilla.org/en-US/developers/addons
