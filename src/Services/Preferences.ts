module JustinCredible.SmartHomeMobile.Services {

    /**
     * Provides a way to easily get/set user preferences.
     * 
     * The current backing store is local storage and/or session storage:
     * https://cordova.apache.org/docs/en/3.0.0/cordova_storage_storage.md.html#localStorage
     */
    export class Preferences {

        public static ID = "Preferences";

        public static get $inject(): string[] {
            return [Utilities.ID];
        }

        public Utilities: Utilities;

        //#region Local Storage Keys

        private static PIN = "PIN";

        private static DEFAULT_CATEGORY_NAME = "DEFAULT_CATEGORY_NAME";
        private static CATEGORY_ORDER = "CATEGORY_ORDER";

        private static ALERT_ME_API_URL = "ALERT_ME_API_URL";
        private static ALERT_ME_USER_NAME = "ALERT_ME_USER_NAME";
        private static ALERT_ME_PASSWORD = "ALERT_ME_PASSWORD";

        private static USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE = "USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE";
        private static IRRIGATION_CADDY_URL = "IRRIGATION_CADDY_URL";
        private static IRRIGATION_CADDY_USER_NAME = "IRRIGATION_CADDY_USER_NAME";
        private static IRRIGATION_CADDY_PASSWORD = "IRRIGATION_CADDY_PASSWORD";

        private static CAMERAS = "CAMERAS";

        //#endregion

        constructor(Utilities: Utilities) {
            this.Utilities = Utilities;
        }

        //#region PIN

        get pin(): string {
            return localStorage.getItem(Preferences.PIN);
        }

        set pin(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.PIN);
            }
            else {
                localStorage.setItem(Preferences.PIN, value);
            }
        }

        //#endregion PIN

        //#region Passphrase

        /**
         * Indicates if the user has configured a security passphrase previously.
         */
        public get isPassphraseConfigured(): boolean {
            if (this.Utilities.isChromeExtension) {
                // If a hash of a passphrase is present in storage it indicates that
                // the user has previously configured a passphrase.
                return !!this.passphraseHash;
            }
            else {
                return false;
            }
        }

        /**
         * Sets the user's new passphrase value, overwriting the existing passphrase.
         * This method handles re-encrypting the preferences with the new passphrase.
         */
        public setPassphrase(passphrase: string): void {

            if (!this.Utilities.isChromeExtension) {
                throw new Error("setPassphraseForSession() is only applicable when running as a Chrome extension.");
            }

            // Grab the existing preference values before we set the new passphrase.
            // If there was a passphrase already set it will be used by the property
            // getters to decrypt the values.
            var alertMeApiUserName = this.alertMeApiUserName;
            var alertMeApiPassword = this.alertMeApiPassword;

            if (passphrase) {
                // Calculate and store the new passphrase's hash value.
                this.passphraseHash = CryptoJS.AES.encrypt(Preferences.USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE, passphrase).toString();

                // Push the passphrase into memory so it can be used for encryption.
                this.setPassphraseForSession(passphrase);
            }
            else {
                this.passphraseHash = null;
                this.setPassphraseForSession(null);
            }

            // Set the preference values back so they can be encrypted.
            this.alertMeApiUserName = alertMeApiUserName;
            this.alertMeApiPassword = alertMeApiPassword;
        }

        /**
         * Sets the passphrase that will be used during the current session to decrypt
         * preference values.
         */
        public setPassphraseForSession(passphrase: string): void {

            if (!this.Utilities.isChromeExtension) {
                throw new Error("setPassphraseForSession() is only applicable when running as a Chrome extension.");
            }

            if (passphrase) {

                // If a passphrase is being set, then we need to make sure a passphrase has been
                // configured and validate it against the one that was originally set. There is no
                // point in letting the user use the app with the wrong passphrase (which will cause
                // the decrypted values to be junk).

                if (!this.isPassphraseConfigured) {
                    throw new Error("A passphrase cannot be set for a session when a passphrase is not configured.");
                }

                if (!this.isPassphraseValid(passphrase)) {
                    throw new Error("The given passphrase could not be set for the current session because it is not the correct passphrase.");
                }
            }
            else {

                // If a passphrase is being cleared (ie set to null), then we need to make sure a
                // passphrase has not been configured. There is no point in letting the user use the
                // app with a null passphrase (which will cause the decrypted values to be junk).

                if (this.isPassphraseConfigured) {
                    throw new Error("A passphrase cannot be cleared for a session when a passphrase is configured.");
                }
            }

            // Grab the background page for our extension.
            var backgroundPageWindow = <ChromeExtensionBackgroundWindow>chrome.extension.getBackgroundPage();

            // Store the unencrypted passphrase on the in-memory state object.
            backgroundPageWindow.state.passphrase = passphrase;
        }

        /**
         * A private method used to get this session's currently set passphrase for decryption of
         * preference values. This method should always remain private to this module.
         */
        private getPassphraseForSession(): string {

            if (!this.Utilities.isChromeExtension) {
                throw new Error("getPassphraseForSession() is only applicable when running as a Chrome extension.");
            }

            // Grab the background page for our extension.
            var backgroundPageWindow = <ChromeExtensionBackgroundWindow>chrome.extension.getBackgroundPage();

            // Retrieve the unencrypted passphrase from the in-memory state object.
            return backgroundPageWindow.state.passphrase;
        }

        /**
         * Indicates if a passphrase has been set for the current session.
         */
        public get isPassphraseForSessionSet(): boolean {

            if (!this.Utilities.isChromeExtension) {
                throw new Error("isPassphraseForSessionSet() is only applicable when running as a Chrome extension.");
            }

            // Grab the background page for our extension.
            var backgroundPageWindow = <ChromeExtensionBackgroundWindow>chrome.extension.getBackgroundPage();

            // Retrieve the unencrypted passphrase from the in-memory state object.
            // Cast it to a boolean value which indicates if it is set or not.
            return !!backgroundPageWindow.state.passphrase;
        }

        public isPassphraseValid(passphrase: string): boolean {

            if (!this.Utilities.isChromeExtension) {
                throw new Error("isPassphraseValid() is only applicable when running as a Chrome extension.");
            }

            if (!this.isPassphraseConfigured) {
                throw new Error("A passphrase cannot be validated when a passphrase is not configured.");
            }

            // Use the given passphrase to decrypt the arbitrary value.
            var decryptedArbitraryValue = CryptoJS.AES.decrypt(this.passphraseHash, passphrase).toString(CryptoJS.enc.Utf8);

            // If the decrypted version matches the original string, the passphrase is correct.
            return decryptedArbitraryValue === Preferences.USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE;
        }

        /**
         * This does not store an actual hash of the passphrase, but instead it stores a hash of
         * the string "USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE" that was encrypted by a passphrase.
         * 
         * This is used to determine if a passphrase value matches the original without storing the
         * original in local storage.
         * 
         * If set, indicates that the user has configured a passphrase.
         * 
         * This property should always remain private to this module.
         */
        private set passphraseHash(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE);
            }
            else {
                localStorage.setItem(Preferences.USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE, value);
            }
        }

        /**
         * This does not store an actual hash of the passphrase, but instead it stores a hash of
         * the string "USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE" that was encrypted by a passphrase.
         * 
         * This is used to determine if a passphrase value matches the original without storing the
         * original in local storage.
         * 
         * If set, indicates that the user has configured a passphrase.
         * 
         * This property always remain private to this module.
         */
        private get passphraseHash(): string {
            return localStorage.getItem(Preferences.USER_PASSPHRASE_ENCRYPTED_ARBITRARY_VALUE);
        }

        //#endregion

        //#region URLs/Credentials

        get alertMeApiUrl(): string {
            return localStorage.getItem(Preferences.ALERT_ME_API_URL);
        }

        set alertMeApiUrl(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.ALERT_ME_API_URL);
            }
            else {
                localStorage.setItem(Preferences.ALERT_ME_API_URL, value);
            }
        }

        get alertMeApiUserName(): string {

            var value =  localStorage.getItem(Preferences.ALERT_ME_USER_NAME);

            // When running as a Chrome extension, the value will be encrypted with the user's passphrase.
            // Therefore we need to decrypt it here before returning it.
            if (value && this.Utilities.isChromeExtension && this.isPassphraseConfigured) {

                if (!this.getPassphraseForSession()) {
                    throw new Error("A passphrase is configured, but one has not be set for the current session so the preference value cannot be decrypted.");
                }

                value = CryptoJS.AES.decrypt(value, this.getPassphraseForSession()).toString(CryptoJS.enc.Utf8);
            }

            return value;
        }

        set alertMeApiUserName(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.ALERT_ME_USER_NAME);
            }
            else if (this.Utilities.isChromeExtension && this.isPassphraseConfigured) {
                // When running as a Chrome extension we'll encrypt the value with the user's passphrase
                // Therefore we need to decrypt it here before returning it.

                if (!this.getPassphraseForSession()) {
                    throw new Error("A passphrase is configured, but one has not be set for the current session so the preference value cannot be encrypted.");
                }

                var encryptedValue = CryptoJS.AES.encrypt(value, this.getPassphraseForSession()).toString();
                localStorage.setItem(Preferences.ALERT_ME_USER_NAME, encryptedValue);
            }
            else {
                localStorage.setItem(Preferences.ALERT_ME_USER_NAME, value);
            }
        }

        get alertMeApiPassword(): string {

            var value = localStorage.getItem(Preferences.ALERT_ME_PASSWORD);

            // When running as a Chrome extension, the value will be encrypted with the user's passphrase.
            // Therefore we need to decrypt it here before returning it.
            if (value && this.Utilities.isChromeExtension && this.isPassphraseConfigured) {

                if (!this.getPassphraseForSession()) {
                    throw new Error("A passphrase is configured, but one has not be set for the current session so the preference value cannot be decrypted.");
                }

                value = CryptoJS.AES.decrypt(value, this.getPassphraseForSession()).toString(CryptoJS.enc.Utf8);
            }

            return value;
        }

        set alertMeApiPassword(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.ALERT_ME_PASSWORD);
            }
            else if (this.Utilities.isChromeExtension && this.isPassphraseConfigured) {
                // When running as a Chrome extension we'll encrypt the value with the user's passphrase
                // Therefore we need to decrypt it here before returning it.

                if (!this.getPassphraseForSession()) {
                    throw new Error("A passphrase is configured, but one has not be set for the current session so the preference value cannot be encrypted.");
                }

                var encryptedValue = CryptoJS.AES.encrypt(value, this.getPassphraseForSession()).toString();
                localStorage.setItem(Preferences.ALERT_ME_PASSWORD, encryptedValue);
            }
            else {
                localStorage.setItem(Preferences.ALERT_ME_PASSWORD, value);
            }
        }

        get irrigationCaddyUrl(): string {
            return localStorage.getItem(Preferences.IRRIGATION_CADDY_URL);
        }

        set irrigationCaddyUrl(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.IRRIGATION_CADDY_URL);
            }
            else {
                localStorage.setItem(Preferences.IRRIGATION_CADDY_URL, value);
            }
        }

        get irrigationCaddyUserName(): string {
            return localStorage.getItem(Preferences.IRRIGATION_CADDY_USER_NAME);
        }

        set irrigationCaddyUserName(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.IRRIGATION_CADDY_USER_NAME);
            }
            else {
                localStorage.setItem(Preferences.IRRIGATION_CADDY_USER_NAME, value);
            }
        }

        get irrigationCaddyPassword(): string {
            return localStorage.getItem(Preferences.IRRIGATION_CADDY_PASSWORD);
        }

        set irrigationCaddyPassword(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.IRRIGATION_CADDY_PASSWORD);
            }
            else {
                localStorage.setItem(Preferences.IRRIGATION_CADDY_PASSWORD, value);
            }
        }

        //#endregion

        //#region Cameras

        get cameras(): Models.Camera[] {
            var json = localStorage.getItem(Preferences.CAMERAS);

            if (json == null) {
                return null;
            }
            else {
                return JSON.parse(json);
            }
        }

        set cameras(value: Models.Camera[]) {
            if (value == null) {
                localStorage.removeItem(Preferences.CAMERAS);
            }
            else {
                localStorage.setItem(Preferences.CAMERAS, JSON.stringify(value));
            }
        }

        //#endregion

        //#region User Interface

        get categoryOrder(): string[] {
            var json = localStorage.getItem(Preferences.CATEGORY_ORDER);

            if (json == null) {
                return null;
            }
            else {
                return JSON.parse(json);
            }
        }

        set categoryOrder(value: string[]) {
            if (value == null) {
                localStorage.removeItem(Preferences.CATEGORY_ORDER);
            }
            else {
                localStorage.setItem(Preferences.CATEGORY_ORDER, JSON.stringify(value));
            }
        }

        /**
         * Returns the categories for the application in their default sort order.
         */
        public get categories(): ViewModels.CategoryItemViewModel[] {

            // Define the default set of categories.
            var categories = [
                new ViewModels.CategoryItemViewModel("Security", "#/app/security", "ion-locked", 0),
                new ViewModels.CategoryItemViewModel("Thermostat", "#/app/thermostat", "ion-thermometer", 1),
                new ViewModels.CategoryItemViewModel("Lighting / Power", "#/app/smart-plugs", "ion-ios-lightbulb", 2),
                new ViewModels.CategoryItemViewModel("Cameras", "#/app/cameras", "ion-ios-videocam", 3)
                //new ViewModels.CategoryItemViewModel("Irrigation", "#/app/irrigation", "ion-ios-rainy", 4)
            ];

            // If the user has ordering preferences, then apply their custom ordering.
            if (this.categoryOrder) {
                this.categoryOrder.forEach((categoryName: string, index: number) => {
                    var categoryItem = _.where(categories, { name: categoryName })[0];

                    if (categoryItem) {
                        categoryItem.order = index;
                    }
                });
            }

            // Ensure the list is sorted by the order.
            categories = _.sortBy(categories, "order");

            return categories;
        }

        /**
         * Used to find a category by name. If a category with the given name is
         * not found, null will be returned.
         * 
         * @returns A category with the match name, or null.
         */
        public getCategoryByName(name: string): ViewModels.CategoryItemViewModel {
            return _.findWhere(this.categories, { name: name });
        }

        /**
         * Returns the name of the category that is set as the default.
         * If a default hasn't been set, then it will use first category's name.
         */
        public get defaultCategoryName(): string {
            var value = localStorage.getItem(Preferences.DEFAULT_CATEGORY_NAME);

            if (value == null) {
                return this.categories[0].name;
            }
            else {
                return value;
            }
        }

        /**
         * Sets the name of the category that should be the default.
         */
        public set defaultCategoryName(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.DEFAULT_CATEGORY_NAME);
            }
            else {
                localStorage.setItem(Preferences.DEFAULT_CATEGORY_NAME, value);
            }
        }

        //#endregion
    }
}
