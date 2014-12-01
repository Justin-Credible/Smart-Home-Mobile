module JustinCredible.SmartHomeMobile.Services {

    /**
     * A service wrapper for the AlertMe API.
     */
    export class AlertMeApi {

        public static $inject = ["$rootScope", "$q", "$http", "Preferences", "Utilities"];

        public static URL_NOT_SPECIFIED_EVENT = "AlertMeApi.URL_NOT_SPECIFIED";
        public static CREDENTIALS_NOT_SPECIFIED_EVENT = "AlertMeApi.CREDENTIALS_NOT_SPECIFIED";

        public static URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION = "AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED";
        public static UNKNOWN_ORIGINAL_METHOD_REJECTION = "AlertMeApi.UNKNOWN_ORIGINAL_METHOD";

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
            Off: "off"
        };

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

        private isUrlSpecified(): boolean {
            return !!this.Preferences.alertMeApiUrl;
        }

        private areCredentialsSpecified(): boolean {
            return !!this.Preferences.alertMeUserName && !!this.Preferences.alertMePassword;
        }

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

        //private getInvalidSessionHandler(originalMethod: string, originalPromise: ng.IDeferred<any>): (response: ng.IHttpPromiseCallbackArg<any>) => void {

        //    return (response: ng.IHttpPromiseCallbackArg<any>) => {
        //        if (response.status === 401) {
        //            this.login().then((result: AlertMeApiTypes.LoginResult) => {
        //                switch (originalMethod) {
        //                    case "homeStatus":
        //                        this.homeStatus().then(originalPromise.resolve, originalPromise.reject);
        //                        break;
        //                    default:
        //                        originalPromise.reject(AlertMeApi.UNKNOWN_ORIGINAL_METHOD_REJECTION);
        //                        break;
        //                }
        //            }, (err) => { originalPromise.reject(err); });
        //        }
        //        else {
        //            //return rejection;
        //            originalPromise.reject(response);
        //        }
        //    };
        //}

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
                    username: this.Preferences.alertMeUserName,
                    password: this.Preferences.alertMePassword,
                    caller: "JustinCredible.SmartHomeMobile"
                })
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.LoginResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

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

        public getHomeStatus(): ng.IPromise<any> {
            var q = this.$q.defer<any>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/homeStatus", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<any>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        public getAlarm(): ng.IPromise<AlertMeApiTypes.AlarmGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.AlarmGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        public getAlarmOverview(): ng.IPromise<AlertMeApiTypes.AlarmOverviewGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmOverviewGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm/overview", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

            httpConfig = {
                method: "GET",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.AlarmOverviewGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        public getLocks(): ng.IPromise<AlertMeApiTypes.LocksGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.LocksGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/locks", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

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
         * all of the locks (when passing "all" as the device ID).
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

            url = this.Utilities.format("{0}/users/{1}/widgets/locks/{2}/lockState", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName, deviceId);

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
         * Used to change the mode of the alarm.
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

            url = this.Utilities.format("{0}/users/{1}/widgets/alarm/mode", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

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

        /**
         * Used to get the state of any smart plug devices (eg lighting, outlets, fans, blindes, etc).
         */
        public getSmartPlugs(): ng.IPromise<AlertMeApiTypes.SmartPlugsGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.SmartPlugsGetResult>(),
                url: string,
                httpConfig: Interfaces.RequestConfig;

            if (!this.arePreconditionsMet()) {
                q.reject(AlertMeApi.URL_OR_CREDENTIALS_NOT_SPECIFIED_REJECTION);
                return q.promise;
            }

            url = this.Utilities.format("{0}/users/{1}/widgets/smartplugs", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName);

            httpConfig = {
                method: "get",
                url: url
            };

            this.$http(httpConfig).then((result: ng.IHttpPromiseCallbackArg<AlertMeApiTypes.SmartPlugsGetResult>) => {
                q.resolve(result.data);
            }, q.reject);

            return q.promise;
        }

        /**
         * Used to change the state of an individual smart plug device (if passed a device ID) or
         * all of the smart plug devices (when passing "all" as the device ID).
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

            url = this.Utilities.format("{0}/users/{1}/widgets/smartplugs/{2}/onOffState", this.Preferences.alertMeApiUrl, this.Preferences.alertMeUserName, deviceId);

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
    }
}