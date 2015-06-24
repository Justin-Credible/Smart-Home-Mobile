module JustinCredible.SmartHomeMobile.Services {

    /**
     * A service wrapper for the AlertMe API.
     */
    export class AlertMeApi {

        //#region Event Constants

        public static URL_NOT_SPECIFIED_EVENT = "AlertMeApi.URL_NOT_SPECIFIED";
        public static CREDENTIALS_NOT_SPECIFIED_EVENT = "AlertMeApi.CREDENTIALS_NOT_SPECIFIED";

        public static URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION = "AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED";
        public static UNKNOWN_ORIGINAL_METHOD_REJECTION = "AlertMeApi.UNKNOWN_ORIGINAL_METHOD";

        //#endregion

        //#region Parameter Constants

        /**
         * The state of a lock; can be used with AlertMeApi.lockState(...)
         */
        public static LockState = {
            Locked: "LOCKED",
            Unlocked: "UNLOCKED",
            BuzzIn: "BUZZ_IN"
        };

        /**
         * The mode for the alarm; can be used with AlertMeApi.setAlarmMode(...)
         */
        public static AlarmMode = {
            Home: "HOME",
            Away: "AWAY",
            Night: "NIGHT"
        };

        /**
         * The on/off state of a smart plug device; can be used with AlertMeApi.setSmartPlugOnOffState(...)
         */
        public static SmartPlugOnOffState = {
            On: "on",
            Off: "off",
            Unavailable: "UNAVAILABLE"
        };

        /**
         * The mode for a climate device.
         */
        public static ClimateMode = {
            Heat: "HEAT",
            Cool: "COOL",
            Off: "OFF",
            Climate: "CLIMATE"
        };

        /**
         * The on/off state of a climate device.
         */
        public static ClimateOnOffState = {
            On: "ON",
            Off: "OFF"
        };

        /**
         * The temperature unit for a climate device.
         */
        public static ClimateTemperatureUnit = {
            Celsius: "C",
            Fahrenheit: "F"
        };

        /**
         * The statues for a given widget.
         */
        public static WidgetStatus = {
            DeviceMissing: "DEVICE_MISSING",
            OK: "OK"
        };

        //#endregion

        public static $inject = ["$rootScope", "$q", "$http", "Preferences", "Utilities"];

        private $rootScope: ng.IRootScopeService;
        private $q: ng.IQService;
        private $http: ng.IHttpService;
        private Preferences: Services.Preferences;
        private Utilities: Services.Utilities;

        constructor($rootScope: ng.IRootScopeService, $q: ng.IQService, $http: ng.IHttpService, Preferences: Services.Preferences, Utilities: Services.Utilities) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$http = $http;
            this.Preferences = Preferences;
            this.Utilities = Utilities;
        }

        //#region Private Helpers

        /**
         * Used to check if the URL for the AlertMe API service has been configured.
         * 
         * @returns True if the URL has been configured, false otherwise.
         */
        private isUrlSpecified(): boolean {
            return !!this.Preferences.alertMeApiUrl;
        }

        /**
         * Used to check if the AlertMe API credentials have been configured.
         * 
         * @returns True if the credentials have been configured, false otherwise.
         */
        private areCredentialsSpecified(): boolean {
            return !!this.Preferences.alertMeApiUserName && !!this.Preferences.alertMeApiPassword;
        }

        /**
         * Used to determine if all of the pre-conditions for calling the AlertMe API
         * have been satisfied. Currently this checks for the configuration of the URL
         * and credentials.
         * 
         * @returns True if all pre-conditions have been met, false otherwise.
         */
        private arePreconditionsMet(): boolean {
            if (!this.isUrlSpecified()) {
                this.$rootScope.$broadcast(AlertMeApi.URL_NOT_SPECIFIED_EVENT);
                return false;
            }
            else if (!this.areCredentialsSpecified()) {
                this.$rootScope.$broadcast(AlertMeApi.CREDENTIALS_NOT_SPECIFIED_EVENT);
                return false;
            }
            else {
                return true;
            }
        }

        /**
         * This is used to transform an arbitrary object into a form submission key/value
         * pair string that can be sent over the wire.
         * 
         * @param data The arbitrary object to encode.
         * @returns The form key/value pair encoding of the given data object.
         */
        private transformRequest(data: any): string {
            var str = [];

            for (var key in data) {
                if (!data.hasOwnProperty(key)) {
                    continue;
                }

                str.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
            }

            return str.join("&");
        }

        //#endregion

        //#region Authentication

        /**
         * Used to authenticate with the AlertMe API using the crednetials specified
         * via the preferences. This utilizes the POST /login endpoint.
         */
        public login(): ng.IPromise<AlertMeApiTypes.LoginResult> {
            var q = this.$q.defer<AlertMeApiTypes.LoginResult>(),
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            httpConfig = {
                method: "POST",
                url: this.Preferences.alertMeApiUrl + "/login",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                data: this.transformRequest({
                    username: this.Preferences.alertMeApiUserName,
                    password: this.Preferences.alertMeApiPassword,
                    caller: "JustinCredible.SmartHomeMobile"
                })
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.LoginResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to de-authenticate with the AlertMe API. This utlilizes the POST /logout endpoint.
         */
        public logout(): ng.IPromise<any> {
            var q = this.$q.defer<any>(),
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            httpConfig = {
                method: "POST",
                url: this.Preferences.alertMeApiUrl + "/logout"
            };

            this.$http(httpConfig).then(q.resolve, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Home Status

        /**
         * Used to get information about all of the devices for the current hub (home).
         * This utilizes the GET /widgets/homeStatus endpoint.
         */
        public getHomeStatus(): ng.IPromise<AlertMeApiTypes.HomeStatusGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.HomeStatusGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/homeStatus", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.HomeStatusGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Security

        /**
         * Used to get alarm status. This utilizes the GET /widgets/alarm endpoint.
         */
        public getAlarm(): ng.IPromise<AlertMeApiTypes.AlarmGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.AlarmGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to get an overview of the alarm devices. This utilizes the
         * GET /widgets/alarm/overview endpoint.
         */
        public getAlarmOverview(): ng.IPromise<AlertMeApiTypes.AlarmOverviewGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmOverviewGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm/overview", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.AlarmOverviewGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to get information about the locks. This utilizes the GET /widgets/locks endpoint.
         */
        public getLocks(): ng.IPromise<AlertMeApiTypes.LocksGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.LocksGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/locks", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.LocksGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the state of an individual lock (if passed a device ID) or
         * all of the locks (when passing "all" as the device ID). This utilizes the
         * PUT /widgets/locks/:deviceId/lockState endpoint.
         * 
         * @param deviceId The device ID of the lock to operate on (or "all" to operate on all locks).
         * @param lockState The state to set the lock(s); one of the values provided by AlertMeApi.LockState.
         */
        public setLockState(deviceId: string, lockState: string): ng.IPromise<AlertMeApiTypes.LockStatePutResult> {
            var q = this.$q.defer<AlertMeApiTypes.LockStatePutResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/locks/{2}/lockState", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName, deviceId);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("lockState={0}", lockState)
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.LockStatePutResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the mode of the alarm. This utilizes the PUT /widgets/alarm/mode endpoint.
         * 
         * @param mode The mode to use to set the alarm; one of the values provided by AlertMeApi.AlarmMode.
         * @param now If the parameter is true, the alarm mode is set immediately.
         * @param checkState If the parameter is true, error states will be checked before allowing the mode
         *          to be changed (for example, if a contact sensor is open the alarm mode cannot be set to
         *          a non-armed state, and therefore the CONTACT_SENSOR_OPEN error would occur).
         *          NOTE: [10-27-14] This parameter doesn't seem to be respected by the v5 API- if a contact
         *          sensor is open, there will be a 15 second grace period, and then the alarm will be armed.
         */
        public setAlarmMode(mode: string, now: boolean, checkState: boolean): ng.IPromise<AlertMeApiTypes.AlarmModePutResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmModePutResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm/mode", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("mode={0}&now={1}&checkState={2}", mode, now, checkState)
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.AlarmModePutResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Smart Plugs

        /**
         * Used to get the state of any smart plug devices (eg lighting, outlets, fans, blindes, etc).
         * This utilizes the GET /widgets/smartplugs endpoint.
         */
        public getSmartPlugs(): ng.IPromise<AlertMeApiTypes.SmartPlugsGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.SmartPlugsGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/smartplugs", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.SmartPlugsGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the state of an individual smart plug device (if passed a device ID) or
         * all of the smart plug devices (when passing "all" as the device ID). This utilizes the
         * PUT /widgets/smartplugs/:deviceId/onOffState endpoint.
         * 
         * @param deviceId The device ID of the smart plug to operate on (or "all" to operate on all devices).
         * @param onOffState The state to set the smart plug(s); one of the values provided by AlertMeApi.SmartPlugOnOffState.
         */
        public setSmartPlugState(deviceId: string, onOffState: string): ng.IPromise<void> {
            var q = this.$q.defer<void>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/smartplugs/{2}/onOffState", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName, deviceId);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("onOffState={0}", onOffState)
            };

            this.$http(httpConfig).then(() => {
                q.resolve();
            }, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Climate

        /**
         * Used to get the state of of the climate control devices(s) and other related temperature information.
         * This utilizes the GET /widgets/climate endpoint.
         * 
         * @param deviceId The optional device ID to retrieve information for; will return the default device otherwise.
         */
        public getClimate(deviceId?: string): ng.IPromise<AlertMeApiTypes.ClimateGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.ClimateGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/climate", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName);

            if (deviceId) {
                url += "/" + deviceId;
            }

            httpConfig = {
                method: "get",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.ClimateGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the on/off state of a climate device (thermostat). This utilizes the
         * PUT /widgets/climate/:deviceId/onOffState endpoint.
         * 
         * 
         * @param deviceId The device ID of themostat to operate on.
         * @param climateMode The on/off state to set; one of the values provided by AlertMeApi.ClimateOnOffState.
         */
        public setClimateOnOffState(deviceId: string, climateOnOffState: string): ng.IPromise<void> {
            var q = this.$q.defer<void>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/climate/{2}/onOffState", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName, deviceId);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("onOffState={0}", climateOnOffState)
            };

            this.$http(httpConfig).then(() => {
                q.resolve();
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the mode of a climate device (thermostat). This utilizes the
         * PUT /widgets/climate/:deviceId/mode endpoint.
         * 
         * @param deviceId The device ID of themostat to operate on.
         * @param climateMode The mode to set; one of the values provided by AlertMeApi.ClimateMode.
         */
        public setClimateMode(deviceId: string, climateMode: string): ng.IPromise<AlertMeApiTypes.ClimateModePutResult> {
            var q = this.$q.defer<AlertMeApiTypes.ClimateModePutResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/climate/{2}/mode", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName, deviceId);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("mode={0}", climateMode)
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.ClimateModePutResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the target temperature of a climate device (thermostat). This utilizes the
         * PUT /widgets/climate/:deviceId/targetTemperature endpoint.
         * 
         * @param deviceId The device ID of themostat to operate on.
         * @param temperature The temperature to set.
         * @param temperatureUnit The unit of the temperature parameter; one of the values provided by AlertMeApi.ClimateTemperatureUnit.
         */
        public setClimateTargetTemperature(deviceId: string, temperature: number, temperatureUnit: string): ng.IPromise<void> {
            var q = this.$q.defer<void>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/climate/{2}/targetTemperature", this.Preferences.alertMeApiUrl, this.Preferences.alertMeApiUserName, deviceId);

            httpConfig = {
                method: "PUT",
                url: url,
                data: this.Utilities.format("temperature={0}&temperatureUnit={1}", temperature, temperatureUnit)
            };

            this.$http(httpConfig).then(() => {
                q.resolve();
            }, q.reject);

            return q.promise;
        }

        //#endregion
    }
}
