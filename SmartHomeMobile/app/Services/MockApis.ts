module JustinCredible.SmartHomeMobile.Services {

    /*tslint:disable typedef*/

    /**
     * Provides a set of mocked up APIs for functions that aren't available in the Apache
     * Ripple Emulator. Also allows us to mock up responses to API requests when the application
     * is in "Mock API" mode (via the development tools).
     */
    export class MockApis {

        public static $inject = ["$q", "$httpBackend", "$ionicPopup", "$ionicLoading", "Utilities"];

        private $q: ng.IQService;
        private $httpBackend: ng.IHttpBackendService;
        private Utilities: Utilities;
        private $ionicPopup: any;
        private $ionicLoading: any;

        private isProgressIndicatorShown: boolean;

        constructor($q: ng.IQService, $httpBackend: ng.IHttpBackendService, $ionicPopup: any, $ionicLoading: any, Utilities: Utilities) {
            this.$q = $q;
            this.$httpBackend = $httpBackend;
            this.Utilities = Utilities;
            this.$ionicPopup = $ionicPopup;
            this.$ionicLoading = $ionicLoading;

            this.isProgressIndicatorShown = false;
        }

        //#region Public API

        /**
         * Used to setup a random delay time for mock HTTP requests.
         * 
         * @param $provide The provider service which will be used to obtain and decorate the httpBackend service.
         */
        public static setupMockHttpDelay($provide: ng.auto.IProvideService) {
            var maxDelay = 3000,
                minDelay = 1000;

            // Example taken from the following blog post:
            // http://endlessindirection.wordpress.com/2013/05/18/angularjs-delay-response-from-httpbackend/
            $provide.decorator("$httpBackend", function ($delegate) {
                var proxy = function (method, url, data, callback, headers) {
                    var interceptor = function () {
                        var _this = this,
                            _arguments = arguments,
                            delay: number;

                        if (url.indexOf(".html") > -1) {
                            // Don't apply a delay for templates.
                            callback.apply(_this, _arguments);
                        }
                        else {
                            // http://jsfiddle.net/alanwsmith/GfAhy/
                            delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);

                            setTimeout(function () {
                                callback.apply(_this, _arguments);
                            }, delay);
                        }
                    };
                    return $delegate.call(this, method, url, data, interceptor, headers);
                };

                /*tslint:disable forin*/
                for (var key in $delegate) {
                    proxy[key] = $delegate[key];
                }
                /*tslint:enable forin*/

                return proxy;
            });
        }

        /**
         * Used to mock the responses for the $http service. Useful when debugging
         * or demo scenarios when a backend is not available.
         * 
         * This can only be called once per page (ie on page load). Subsequent calls
         * will not remove existing mock rules.
         * 
         * @param mock True to mock API calls, false to let them pass through normally.
         */
        public mockHttpCalls(mock: boolean) {

            // Always allow all requests for templates to go through.
            this.$httpBackend.whenGET(/.*\.html/).passThrough();

            if (mock) {
                // Mock up all the API requests.
                this.$httpBackend.whenGET(/widgets\/locks/).respond(200, this.getMockLocksGetResponse());
                this.$httpBackend.whenGET(/widgets\/alarm\/overview/).respond(200, this.getMockAlarmOverviewGetResponse());
                this.$httpBackend.whenGET(/widgets\/alarm/).respond(200, this.getMockAlarmGetResponse());
                this.$httpBackend.whenGET(/widgets\/smartplugs/).respond(200, this.getMockSmartPlugsGetResponse());
                this.$httpBackend.whenGET(/widgets\/climate/).respond(200, this.getMockClimateGetResponse());
            }
            else {
                // Allow ALL HTTP requests to go through.
                this.$httpBackend.whenDELETE(/.*/).passThrough();
                this.$httpBackend.whenGET(/.*/).passThrough();
                //this.$httpBackend.whenHEAD(/.*/).passThrough(); //TODO The ts.d includes whenHEAD but this version of Angular doesn't?
                this.$httpBackend.whenJSONP(/.*/).passThrough();
                this.$httpBackend.whenPATCH(/.*/).passThrough();
                this.$httpBackend.whenPOST(/.*/).passThrough();
                this.$httpBackend.whenPUT(/.*/).passThrough();
            }
        }

        /**
         * Used to mock up the APIs that are not present when running in the Apache Ripple
         * emulator so that we can control what happens in the emulator.
         */
        public mockForRippleEmulator() {
            var mockToastPlugin: ICordovaToastPlugin,
                mockClipboardPlugin: ICordovaClipboardPlugin;

            mockToastPlugin = {
                show: _.bind(this.toast, this),
                showLongBottom: _.bind(this.toast, this),
                showLongCenter: _.bind(this.toast, this),
                showLongTop: _.bind(this.toast, this),
                showShortBottom: _.bind(this.toast, this),
                showShortCenter: _.bind(this.toast, this),
                showShortTop: _.bind(this.toast, this)
            };

            mockClipboardPlugin = {
                copy: _.bind(this.clipboard_copy, this),
                paste: _.bind(this.clipboard_paste, this)
            };

            navigator.notification = {
                alert: _.bind(this.notification_alert, this),
                confirm: _.bind(this.notification_confirm, this),
                prompt: _.bind(this.notification_prompt, this),
                beep: _.bind(this.notification_beep, this),
                vibrate: _.bind(this.notification_vibrate, this)
            };

            window.plugins = {
                toast: mockToastPlugin
            };

            window.ProgressIndicator = {
                hide: _.bind(this.progressIndicator_hide, this),
                showSimple: _.bind(this.progressIndicator_show, this),
                showSimpleWithLabel: _.bind(this.progressIndicator_show, this),
                showSimpleWithLabelDetail: _.bind(this.progressIndicator_show, this),
                showDeterminate: _.bind(this.progressIndicator_show, this),
                showDeterminateWithLabel: _.bind(this.progressIndicator_show, this),
                showAnnular: _.bind(this.progressIndicator_show, this),
                showAnnularWithLabel: _.bind(this.progressIndicator_show, this),
                showBar: _.bind(this.progressIndicator_show, this),
                showBarWithLabel: _.bind(this.progressIndicator_show, this),
                showSuccess: _.bind(this.progressIndicator_show, this),
                showText: _.bind(this.progressIndicator_show, this)
            };

            if (cordova) {
                cordova.plugins = {
                    clipboard: mockClipboardPlugin,
                    pushNotification: null
                };
            }
        }

        /**
         * Used to mock up the APIs that are not present when running in Android.
         */
        public mockForAndroid() {
            window.ProgressIndicator = {
                hide: _.bind(this.progressIndicator_hide, this),
                showSimple: _.bind(this.progressIndicator_show, this),
                showSimpleWithLabel: _.bind(this.progressIndicator_show, this),
                showSimpleWithLabelDetail: _.bind(this.progressIndicator_show, this),
                showDeterminate: _.bind(this.progressIndicator_show, this),
                showDeterminateWithLabel: _.bind(this.progressIndicator_show, this),
                showAnnular: _.bind(this.progressIndicator_show, this),
                showAnnularWithLabel: _.bind(this.progressIndicator_show, this),
                showBar: _.bind(this.progressIndicator_show, this),
                showBarWithLabel: _.bind(this.progressIndicator_show, this),
                showSuccess: _.bind(this.progressIndicator_show, this),
                showText: _.bind(this.progressIndicator_show, this)
            };
        }

        //#endregion

        //#region Mock HTTP Responses

        private getMockAlarmGetResponse(): AlertMeApiTypes.AlarmGetResult {
            return {
                "status": {
                    "deviceName": null,
                    "deviceType": null,
                    "deviceName2": null,
                    "deviceType2": null,
                    "alarm": null,
                    "message": "DISARMED",
                    "time": "1413743959"
                },
                "behaviors": [
                    "HOME",
                    "AWAY",
                    "NIGHT"
                ],
                "targetBehavior": "HOME",
                "behavior": "HOME",
                "showSlider": true,
                "showCancel": false,
                "state": "DISARMED",
                "widgetStatus": "OK",
                "widgetVisible": true
            };
        }

        private getMockAlarmOverviewGetResponse(): AlertMeApiTypes.AlarmOverviewGetResult {
            return {
                "summary": {
                    "message": "LAST_TRIGGERED",
                    "alarm": "Intruder",
                    "triggerTime": "1402190362",
                    "clearTime": "1402190899",
                    "deviceType": "ContactSensor",
                    "deviceName": "Front Door Sensor"
                },
                "triggeredDevices": [],
                "otherDevices": {
                    "00-00-00-00-00-00-00-00": {
                        "name": "Back Window",
                        "type": "ContactSensor",
                        "alarm": "Alarm — Intruder",
                        "presence": true,
                        "state": "CLOSED",
                        "alarmTypes": null
                    },
                    "00-00-00-00-00-00-00-01": {
                        "name": "Front Window",
                        "type": "ContactSensor",
                        "alarm": "Alarm — Intruder",
                        "presence": true,
                        "state": "OPENED",
                        "alarmTypes": null
                    },
                    "00-00-00-00-00-00-00-02": {
                        "name": "Front Door",
                        "type": "ContactSensor",
                        "alarm": "Alarm — Intruder",
                        "presence": true,
                        "state": "CLOSED",
                        "alarmTypes": null
                    },
                    "00-00-00-00-00-00-00-03": {
                        "name": "Water Leak Sensor",
                        "type": "EverspringST812",
                        "alarm": "Safety — Emergency",
                        "presence": true,
                        "state": "",
                        "alarmTypes": [
                            "WATER"
                        ]
                    },
                    "00-00-00-00-00-00-00-04": {
                        "name": "Smoke and CO Detector",
                        "type": "FirstAlertSmokeCOAlarm",
                        "alarm": "Safety — Emergency",
                        "presence": true,
                        "state": "",
                        "alarmTypes": [
                            "SMOKE",
                            "CO"
                        ]
                    },
                    "00-00-00-00-00-00-00-05": {
                        "name": "Keypad",
                        "type": "Keypad",
                        "alarm": "Safety — Panic",
                        "presence": true,
                        "state": "",
                        "alarmTypes": null
                    }
                }
            };
        }

        private getMockLocksGetResponse(): AlertMeApiTypes.LocksGetResult {
            return {
                "locks": [
                    {
                        "id": "00-00-00-00-00-00-00-00",
                        "name": "Door Number 1",
                        "type": "DEADBOLT",
                        "presence": true,
                        "lockState": "LOCKED",
                        "canLock": true,
                        "canBuzzIn": true
                    },
                    {
                        "id": "00-00-00-00-00-00-00-00",
                        "name": "Door Number 2",
                        "type": "DEADBOLT",
                        "presence": true,
                        "lockState": "UNLOCKED",
                        "canLock": true,
                        "canBuzzIn": true
                    },
                    {
                        "id": "00-00-00-00-00-00-00-00",
                        "name": "Door Number 3",
                        "type": "DEADBOLT",
                        "presence": true,
                        "lockState": "UNLOCKED",
                        "canLock": true,
                        "canBuzzIn": true
                    }
                ],
                "atAGlance": {
                    "name": "Main Keypad",
                    "locked": 1,
                    "unlocked": 2,
                    "total": 3
                },
                "widgetStatus": "OK",
                "widgetVisible": true
            };
        }

        private getMockSmartPlugsGetResponse(): AlertMeApiTypes.SmartPlugsGetResult {
            return {
                "smartplugs": [
                    {
                        "id": "00-00-00-00-00-00-00-01",
                        "name": "Kitchen Lights",
                        "type": "JascoBinarySwitch",
                        "controlType": "GENERAL",
                        "plugType": "us",
                        "presence": true,
                        "onOffState": "on",
                        "lastKnownState": "off",
                        "supportsIntensity": false,
                        "intensity": null,
                        "supportsSpeed": false,
                        "speed": null,
                        "applianceType": "LIGHTS",
                        "currency": "USD",
                        "costUnits": "&#36;",
                        "powerUnits": "W",
                        "remoteMode": false,
                        "supportsPower": false,
                        "scheduleEnabled": true,
                        "supportsLock": false,
                        "isLocked": null,
                        "state": null,
                        "bulb": false,
                        "lighting": true,
                        "howAmIDoing": null,
                        "costSoFarToday": "--",
                        "costYesterday": "--",
                        "costPredictedToday": "--",
                        "powerNow": null,
                        "changeSummary": "NO_DATA_FROM_YESTERDAY",
                        "presenceYesterday": false,
                        "nextEvent": null
                    },
                    {
                        "id": "00-00-00-00-00-00-00-02",
                        "name": "Multilevel switch 1",
                        "type": "GenericMultilevelSwitch",
                        "controlType": "INTENSITY",
                        "plugType": "us",
                        "presence": true,
                        "onOffState": "off",
                        "lastKnownState": "off",
                        "supportsIntensity": true,
                        "intensity": 66,
                        "supportsSpeed": false,
                        "speed": null,
                        "applianceType": "LIGHTS",
                        "currency": "USD",
                        "costUnits": "&#36;",
                        "powerUnits": "W",
                        "remoteMode": false,
                        "supportsPower": false,
                        "scheduleEnabled": true,
                        "supportsLock": false,
                        "isLocked": null,
                        "state": null,
                        "bulb": false,
                        "lighting": true,
                        "howAmIDoing": null,
                        "costSoFarToday": "--",
                        "costYesterday": "--",
                        "costPredictedToday": "--",
                        "powerNow": null,
                        "changeSummary": "NO_DATA_FROM_YESTERDAY",
                        "presenceYesterday": false,
                        "nextEvent": null
                    },
                    {
                        "id": "00-00-00-00-00-00-00-03",
                        "name": "Smart Plug 1",
                        "type": "SmartPlug",
                        "controlType": "POWER",
                        "plugType": "us",
                        "presence": true,
                        "onOffState": "on",
                        "lastKnownState": "off",
                        "supportsIntensity": false,
                        "intensity": null,
                        "supportsSpeed": false,
                        "speed": null,
                        "applianceType": "SMARTPLUG",
                        "currency": "USD",
                        "costUnits": "&#36;",
                        "powerUnits": "W",
                        "remoteMode": false,
                        "supportsPower": true,
                        "scheduleEnabled": true,
                        "supportsLock": false,
                        "isLocked": null,
                        "state": null,
                        "bulb": false,
                        "lighting": false,
                        "howAmIDoing": 4,
                        "costSoFarToday": "--",
                        "costYesterday": "--",
                        "costPredictedToday": "--",
                        "powerNow": 0,
                        "changeSummary": "NO_DATA_FROM_YESTERDAY",
                        "presenceYesterday": false,
                        "nextEvent": null
                    },
                    {
                        "id": "00-00-00-00-00-00-00-04",
                        "name": "Other Device",
                        "type": "SmartPlug",
                        "controlType": "POWER",
                        "plugType": "us",
                        "presence": true,
                        "onOffState": "on",
                        "lastKnownState": "off",
                        "supportsIntensity": false,
                        "intensity": null,
                        "supportsSpeed": false,
                        "speed": null,
                        "applianceType": "UNKNOWN",
                        "currency": "USD",
                        "costUnits": "&#36;",
                        "powerUnits": "W",
                        "remoteMode": false,
                        "supportsPower": true,
                        "scheduleEnabled": true,
                        "supportsLock": false,
                        "isLocked": null,
                        "state": null,
                        "bulb": false,
                        "lighting": false,
                        "howAmIDoing": 4,
                        "costSoFarToday": "--",
                        "costYesterday": "--",
                        "costPredictedToday": "--",
                        "powerNow": 0,
                        "changeSummary": "NO_DATA_FROM_YESTERDAY",
                        "presenceYesterday": false,
                        "nextEvent": null
                    }
                ],
                "hubAvailable": true,
                "atAGlance": {
                    "energyHogToday": "--",
                    "energyHogYesterday": "--",
                    "plugsOn": 2,
                    "plugsTotal": 3,
                    "heavyHour": -1,
                    "minimumPower": 0
                },
                "widgetStatus": "OK",
                "widgetVisible": true
            };
        }


        private getMockClimateGetResponse(): AlertMeApiTypes.ClimateGetResult {
            return {
                "devices": {
                    "AD-05-00-DB-D5-E4-96-08": "Main Thermostat"
                },
                "deviceAvailable": true,
                "deviceId": "AD-05-00-DB-D5-E4-96-08",
                "name": "Main Thermostat",
                "battery": "OK",
                "mode": "HEAT",
                "control": "MANUAL",
                "on": true,
                "onOffState": "ON",
                "isSchedule": false,
                "presenceStatus": "AWAY",
                "currentTemperature": 70,
                "targetTemperature": 70,
                "shadowTemperature": 70,
                "minTargetTemperature": 35,
                "maxTargetTemperature": 95,
                "confirmed": true,
                "active": false,
                "type": "climatecontroller",
                "humidity": "56",
                "filter": {
                    "enabled": true,
                    "days": 90,
                    "hours": 0,
                    "date": 1391746027,
                    "usageTime": 621,
                    "totalUsage": 2236723,
                    "changeAt": 1058,
                    "state": "WARNING"
                },
                "feature": false,
                "hubAvailable": true,
                "fanMode": null,
                "formatting": {
                    "locale": "en-GB",
                    "temperatureUnit": "F",
                    "currencyUnit": "GBP",
                    "timezoneOffset": "+00:00"
                },
                "outsideTemperature": 54,
                "temperatureRanges": {
                    "default": {
                        "min": 35,
                        "max": 95
                    }
                },
                "availableFanModes": [],
                "exclScheduleFanModes": [
                    "SCHEDULE"
                ],
                "scheduleFanMode": false,
                "heatTargetTemperature": 70,
                "coolTargetTemperature": 68,
                "current": {
                    "temperature": 62,
                    "time": "08:00",
                    "fanMode": "",
                    "name": "DAY",
                    "setpoint": 1,
                    "start": 1419004800
                },
                "next": {
                    "temperature": 70,
                    "time": "18:00",
                    "fanMode": "",
                    "name": "EVENING",
                    "setpoint": 2,
                    "start": 1419040800,
                    "endTime": "22:00"
                },
                "thermostatType": "General",
                "modes": {
                    "cool": "Cool",
                    "heat": "Heat",
                    "climate": "Auto"
                },
                "controls": {
                    "schedule": "Schedule",
                    "manual": "Hold",
                    "presence": "Presence"
                },
                "messageIcon": null,
                "message": "Outside temperature 54°F",
                "widgetStatus": "OK",
                "widgetVisible": true
            };
        }

        //#endregion

        //#region Mock functions for JS APIs

        //#region Toast

        private toast(message) {
            var div: HTMLDivElement,
                existingToasts: number;

            existingToasts = document.querySelectorAll(".mockToast").length;

            div = document.createElement("div");
            div.className = "mockToast";
            div.style.position = "absolute";
            div.style.bottom = (existingToasts === 0 ? 0 : (35 * existingToasts)) + "px";
            div.style.width = "100%";
            div.style.backgroundColor = "#444444";
            div.style.opacity = "0.8";
            div.style.textAlign = "center";
            div.style.color = "#fff";
            div.style.padding = "10px";
            div.style.zIndex = "9000";
            div.innerText = message;

            document.body.appendChild(div);

            setTimeout(() => {
                document.body.removeChild(div);
            }, 3000);
        }

        //#endregion

        //#region Clipboard

        private clipboard_copy(text: string) {
            prompt("The following text was requested for copy to the clipboard:", text);
        }

        private clipboard_paste() {
            return prompt("A paste from clipboard was requested; enter text for the paste operation:");
        }

        //#endregion

        //#region Notifications

        private notification_alert(message: string, alertCallback: () => void, title?: string, buttonName?: string): void {
            var buttons = [];

            // Default the title.
            title = title || "Alert";

            // Default the button label text.
            buttonName = buttonName || "OK";

            // Build each of the buttons.
            buttons.push({ text: buttonName });

            // Delegate to Ionic's pop-up framework.
            this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then(() => {
                if (alertCallback) {
                    alertCallback();
                }
            });
        }

        private notification_confirm(message: string, confirmCallback: (choice: number) => void, title?: string, buttonLabels?: string[]): void {
            var buttons = [];

            // Default the title.
            title = title || "Confirm";

            // Default the buttons array.
            buttonLabels = buttonLabels || ["Yes", "No"];

            // Build each of the buttons.
            buttonLabels.forEach((value: string, index: number) => {
                buttons.push({
                    text: value,
                    onTap: function (e) {
                        // The native confirm API uses a 1 based button index (not zero based!).
                        return index + 1;
                    }
                });
            });

            // Delegate to Ionic's pop-up framework.
            this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then((result: number) => {
                if (confirmCallback) {
                    confirmCallback(result);
                }
            });
        }

        private notification_prompt(message: string, promptCallback: (result: NotificationPromptResult) => void, title?: string, buttonLabels?: string[], defaultText?: string): void {
            var buttons = [],
                template = this.Utilities.format("<p>{0}</p><input type='text' id='notification_prompt_input'/>", message);

            // Default the title.
            title = title || "Prompt";

            // Default the buttons array.
            buttonLabels = buttonLabels || ["OK", "Cancel"];

            // Build each of the buttons.
            buttonLabels.forEach((value: string, index: number) => {
                buttons.push({
                    text: value,
                    onTap: function (e) {
                        var result: NotificationPromptResult,
                            input: HTMLInputElement;

                        input = <HTMLInputElement>document.getElementById("notification_prompt_input");

                        result = {
                            // The native confirm API uses a 1 based button index (not zero based!).
                            buttonIndex: index + 1,
                            input1: input.value
                        };

                        return result;
                    }
                });
            });

            // Handle defaulting the value.
            if (defaultText) {
                _.defer(function () {
                    var input: HTMLInputElement;

                    input = <HTMLInputElement>document.getElementById("notification_prompt_input");

                    input.value = defaultText;
                });
            }

            // Delegate to Ionic's pop-up framework.
            this.$ionicPopup.show({ title: title, template: template, buttons: buttons }).then((result: NotificationPromptResult) => {
                if (promptCallback) {
                    promptCallback(result);
                }
            });
        }

        private notification_beep(times: number): void {
            this.$ionicPopup.alert({ title: "Beep", template: "Beep count: " + times });
        }

        private notification_vibrate(time: number): void {
            this.$ionicPopup.alert({ title: "Vibrate", template: "Vibrate time: " + time });
        }

        //#endregion

        //#region ProgressIndicator

        private progressIndicator_hide() {
            // There seems to be a bug in the Ionic framework when you close the loading panel
            // very quickly (before it has fully been shown) that the backdrop will remain visible
            // and the user won't be able to click anything. Here we ensure that all calls to hide
            // happen after at least waiting one second.
            setTimeout(() => {
                this.$ionicLoading.hide();
                this.isProgressIndicatorShown = false;
            }, 1000);
        }

        private progressIndicator_show(dimBackground: boolean, labelOrTimeout: any, labelOrPosition: string) {
            var label: string,
                timeout: number;

            if (this.isProgressIndicatorShown) {
                return;
            }

            this.isProgressIndicatorShown = true;

            if (typeof (labelOrTimeout) === "string") {
                label = labelOrTimeout;
            }

            if (typeof (labelOrTimeout) === "number") {
                timeout = labelOrTimeout;
            }

            if (!label) {
                label = "Please Wait...";
            }

            this.$ionicLoading.show({
                template: label
            });

            if (timeout) {
                setTimeout(() => {
                    this.isProgressIndicatorShown = false;
                    this.$ionicLoading.hide();
                }, timeout);
            }
        }

        //#endregion

        //#endregion
    }
}