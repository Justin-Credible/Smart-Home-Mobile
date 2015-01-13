module JustinCredible.SmartHomeMobile.Services {

    /**
     * Provides a way to easily get/set user preferences.
     * 
     * The current backing store is local storage and/or session storage:
     * https://cordova.apache.org/docs/en/3.0.0/cordova_storage_storage.md.html#localStorage
     */
    export class Preferences {

        public static $inject = [];

        //#region Local Storage Keys

        private static ENABLE_DEVELOPER_TOOLS = "ENABLE_DEVELOPER_TOOLS";
        private static ENABLE_FULL_HTTP_LOGGING = "ENABLE_FULL_HTTP_LOGGING";
        private static ENABLE_MOCK_HTTP_CALLS = "ENABLE_MOCK_HTTP_CALLS";

        private static REQUIRE_PIN_THRESHOLD = "REQUIRE_PIN_THRESHOLD";
        private static LAST_PAUSED_AT = "LAST_PAUSED_AT";
        private static PIN = "PIN";

        private static CATEGORY_ORDER = "CATEGORY_ORDER";

        private static ALERT_ME_API_URL = "ALERT_ME_API_URL";
        private static ALERT_ME_USER_NAME = "ALERT_ME_USER_NAME";
        private static ALERT_ME_PASSWORD = "ALERT_ME_PASSWORD";

        private static IRRIGATION_CADDY_URL = "IRRIGATION_CADDY_URL";
        private static IRRIGATION_CADDY_USER_NAME = "IRRIGATION_CADDY_USER_NAME";
        private static IRRIGATION_CADDY_PASSWORD = "IRRIGATION_CADDY_PASSWORD";

        private static CAMERAS = "CAMERAS";

        //#endregion

        //#region Defaults

        // Default setting is 10 minutes.
        private static REQUIRE_PIN_THRESHOLD_DEFAULT = 10;

        //#endregion

        //#region Development Tools

        get enableDeveloperTools(): boolean {
            return sessionStorage.getItem(Preferences.ENABLE_DEVELOPER_TOOLS) === "true";
        }

        set enableDeveloperTools(value: boolean) {
            if (value == null) {
                sessionStorage.removeItem(Preferences.ENABLE_DEVELOPER_TOOLS);
            }
            else {
                sessionStorage.setItem(Preferences.ENABLE_DEVELOPER_TOOLS, value.toString());
            }
        }

        get enableFullHttpLogging(): boolean {
            return localStorage.getItem(Preferences.ENABLE_FULL_HTTP_LOGGING) === "true";
        }

        set enableFullHttpLogging(value: boolean) {
            if (value == null) {
                localStorage.removeItem(Preferences.ENABLE_FULL_HTTP_LOGGING);
            }
            else {
                localStorage.setItem(Preferences.ENABLE_FULL_HTTP_LOGGING, value.toString());
            }
        }

        get enableMockHttpCalls(): boolean {
            return localStorage.getItem(Preferences.ENABLE_MOCK_HTTP_CALLS) === "true";
        }

        set enableMockHttpCalls(value: boolean) {
            if (value == null) {
                localStorage.removeItem(Preferences.ENABLE_MOCK_HTTP_CALLS);
            }
            else {
                localStorage.setItem(Preferences.ENABLE_MOCK_HTTP_CALLS, value.toString());
            }
        }

        //#endregion

        //#region PIN

        get requirePinThreshold(): number {
            var value = localStorage.getItem(Preferences.REQUIRE_PIN_THRESHOLD);
            return value == null ? Preferences.REQUIRE_PIN_THRESHOLD_DEFAULT : parseInt(value, 10);
        }

        set requirePinThreshold(value: number) {
            if (value == null) {
                localStorage.removeItem(Preferences.REQUIRE_PIN_THRESHOLD);
            }
            else {
                localStorage.setItem(Preferences.REQUIRE_PIN_THRESHOLD, value.toString());
            }
        }

        set lastPausedAt(value: Moment) {
            if (value == null) {
                localStorage.removeItem(Preferences.LAST_PAUSED_AT);
            }
            else {
                localStorage.setItem(Preferences.LAST_PAUSED_AT, moment(value).format());
            }
        }

        get lastPausedAt(): Moment {
            var lastPausedAt: string;

            lastPausedAt = localStorage.getItem(Preferences.LAST_PAUSED_AT);

            return moment(lastPausedAt).isValid() ? moment(lastPausedAt) : null;
        }

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

        get alertMeUserName(): string {
            return localStorage.getItem(Preferences.ALERT_ME_USER_NAME);
        }

        set alertMeUserName(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.ALERT_ME_USER_NAME);
            }
            else {
                localStorage.setItem(Preferences.ALERT_ME_USER_NAME, value);
            }
        }

        get alertMePassword(): string {
            return localStorage.getItem(Preferences.ALERT_ME_PASSWORD);
        }

        set alertMePassword(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.ALERT_ME_PASSWORD);
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

        //#endregion
    }
}