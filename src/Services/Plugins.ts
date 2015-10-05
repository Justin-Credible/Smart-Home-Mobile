module JustinCredible.SmartHomeMobile.Services {

    /**
     * Provides access to Cordova plugins.
     * 
     * If the application is not running in Cordova it will return mock implementations.
     */
    export class Plugins {

        //#region Injection

        public static ID = "Plugins";

        public static get $inject(): string[] {
            return [
                Utilities.ID,
                MockPlatformApis.ID
            ];
        }

        constructor(
            private Utilities: Utilities,
            private MockPlatformApis: MockPlatformApis) {
        }

        //#endregion

        //#region Plug-in Accessors

        /**
         * Exposes an API for working with native dialogs and notifications.
         * 
         * NOTE: Standard alert, confirm, and prompt dialogs should always use the corresponding
         * methods from the UiHelper services rather than the notification plugin directly; the
         * UiHelper methods normalize behavior for Ripple as well as standard buttons and titles.
         */
        get notification(): Notification {
            if (this.Utilities.isRipple
                || this.Utilities.isWindowsIoT) {
                return this.MockPlatformApis.getNotificationPlugin();
            }
            else if (navigator.notification) {
                return navigator.notification;
            }
            else {
                return this.MockPlatformApis.getNotificationPlugin();
            }
        }

        /**
         * Exposes an API for showing toast messages.
         */
        get toast(): ICordovaToastPlugin {

            if (this.Utilities.isRipple
                || this.Utilities.isWindows
                || this.Utilities.isWindows8
                || this.Utilities.isWindowsIoT) {
                return this.MockPlatformApis.getToastPlugin();
            }
            else if (window.plugins && window.plugins.toast) {
                return window.plugins.toast;
            }
            else {
                return this.MockPlatformApis.getToastPlugin();
            }
        }

        /**
         * Exposes an API for working with progress indicators.
         */
        get progressIndicator(): ICordovaProgressIndicator {

            if (this.Utilities.isRipple
                || this.Utilities.isWindows
                || this.Utilities.isWindows8
                || this.Utilities.isWindowsIoT) {
                return this.MockPlatformApis.getProgressIndicatorPlugin();
            }
            else if (window.ProgressIndicator) {
                return window.ProgressIndicator;
            }
            else {
                return this.MockPlatformApis.getProgressIndicatorPlugin();
            }
        }

        /**
         * Exposes an API for working with the operating system's clipboard.
         */
        get clipboard(): ICordovaClipboardPlugin {

            if (this.Utilities.isRipple) {
                return this.MockPlatformApis.getClipboardPlugin();
            }
            else if (this.Utilities.isWindows
                || this.Utilities.isWindows8
                || this.Utilities.isWindowsIoT) {
                return this.MockPlatformApis.getClipboardPluginForWindows();
            }
            else if (this.Utilities.isChromeExtension) {
                return this.MockPlatformApis.getClipboardPluginForChromeExtension();
            }
            else if (cordova.plugins && cordova.plugins.clipboard) {
                return cordova.plugins.clipboard;
            }
            else {
                return this.MockPlatformApis.getClipboardPlugin();
            }
        }

        /**
         * Exposes an API for manipulating the device's native status bar.
         */
        get statusBar(): StatusBar {

            if (this.Utilities.isRipple) {
                return this.MockPlatformApis.getStatusBarPlugin();
            }
            else if (window.StatusBar) {
                return window.StatusBar;
            }
            else {
                return this.MockPlatformApis.getStatusBarPlugin();
            }
        }

        /**
         * Exposes an API for adjusting keyboard behavior.
         */
        get keyboard(): Ionic.Keyboard {

            if (this.Utilities.isRipple) {
                return this.MockPlatformApis.getKeyboardPlugin();
            }
            else if (typeof(cordova) !== "undefined" && cordova.plugins && cordova.plugins.Keyboard) {
                return cordova.plugins.Keyboard;
            }
            else {
                return this.MockPlatformApis.getKeyboardPlugin();
            }
        }

        /**
         * Exposes an API for logging exception information to the Crashlytics backend service.
         */
        get crashlytics(): ICordovaCrashlyticsPlugin {

            if (this.Utilities.isRipple) {
                return this.MockPlatformApis.getCrashlyticsPlugin();
            }
            else if (typeof(navigator) !== "undefined" && navigator.crashlytics) {
                return navigator.crashlytics;
            }
            else {
                return this.MockPlatformApis.getCrashlyticsPlugin();
            }
        }

        //#endregion
    }
}
