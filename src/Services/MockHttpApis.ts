module JustinCredible.SmartHomeMobile.Services {

    /**
     * Provides mock responses for HTTP requests.
     * 
     * This can be useful for unit testing or demoing or developing applications
     * without a live internet connection or access to the HTTP APIs.
     */
    export class MockHttpApis {

        //#region Injection

        public static ID = "MockHttpApis";

        public static get $inject(): string[] {
            return [
                "$httpBackend"
            ];
        }

        constructor(
            private $httpBackend: ng.IHttpBackendService) {
        }

        //#endregion

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

                /* tslint:disable:forin */
                for (var key in $delegate) {
                    proxy[key] = $delegate[key];
                }
                /* tslint:enable:forin */

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
                this.$httpBackend.whenGET(/widgets\/homeStatus/).respond(200, this.getMockHomeStatusGetResponse());
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
                //"message": "Your thermostat is currently unavailable",
                "widgetStatus": "OK",
                //"widgetStatus": "DEVICE_MISSING",
                "widgetVisible": true
            };
        }

        private getMockHomeStatusGetResponse(): AlertMeApiTypes.HomeStatusGetResult {
            var devices: { [deviceId: string]: AlertMeApiTypes.HomeStatusDevice },
                hub: AlertMeApiTypes.HomeStatusHub;

            //#region Devices

            devices = {
                "00-00-00-00-00-00-00-01": {
                    "name": "Entryway Range Extender",
                    "type": "Repeater",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 6.4,
                    "batteryLow": false,
                    "lowSignal": true,
                    "batteryLevel": 5,
                    "batteryPercentage": 100,
                    "mains": true,
                    "power": null,
                    "signal": 25,
                    "presence": true,
                    "temperature": null,
                    "version": "2.9r0",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "2.13",
                    "repeaterVersion": 2,
                    "missingProtocols": {
                        "1": "zwave"
                    },
                    "id": "00-00-00-00-00-00-00-01"
                },
                "00-00-00-00-00-00-00-02": {
                    "name": "Main Thermostat",
                    "type": "RtcoaCT101",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 4.34,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 4,
                    "batteryPercentage": 67,
                    "mains": true,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": 25.4,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-02"
                },
                "00-00-00-00-00-00-00-03": {
                    "name": "Inner Garage Door Keypad",
                    "type": "KwiksetDeadbolt",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 3.8,
                    "batteryLow": true,
                    "lowSignal": null,
                    "batteryLevel": 2,
                    "batteryPercentage": 40,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-03"
                },
                "00-00-00-00-00-00-00-04": {
                    "name": "Back Window",
                    "type": "ContactSensor",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.996,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 78,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": 27.25,
                    "version": "2.8r16",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": "CLOSED",
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-04"
                },
                "00-00-00-00-00-00-00-05": {
                    "name": "Back Sliding Door",
                    "type": "ContactSensor",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.963,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 15,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": 26.75,
                    "version": "2.8r16",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": "OPEN",
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-05"
                },
                "00-00-00-00-00-00-00-06": {
                    "name": "Entryway Keypad",
                    "type": "Keypad",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.377,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 3,
                    "batteryPercentage": 5,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "2.8r20",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-06"
                },
                "00-00-00-00-00-00-00-07": {
                    "name": "Front Door Keypad",
                    "type": "KwiksetDeadbolt",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 3.8,
                    "batteryLow": true,
                    "lowSignal": null,
                    "batteryLevel": 2,
                    "batteryPercentage": 40,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-07"
                },
                "00-00-00-00-00-00-00-08": {
                    "name": "Living Room Camera",
                    "type": "Camera",
                    "protocol": [
                        "wifi"
                    ],
                    "battery": null,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": null,
                    "batteryPercentage": null,
                    "mains": true,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "1.0r4",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ready",
                    "isGeneric": false,
                    "hasBattery": false,
                    "state": null,
                    "standalone": false,
                    "upgrade": "ELIGIBLE",
                    "hardwareRevision": "1.11",
                    "id": "00-00-00-00-00-00-00-08"
                },
                "00-00-00-00-00-00-00-09": {
                    "name": "Front Door Sensor",
                    "type": "ContactSensor",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.874,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 100,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": 25.75,
                    "version": "2.8r16",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": "CLOSED",
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-09"
                },
                "00-00-00-00-00-00-00-0A": {
                    "name": "Laundry Room Water Leak Sensor",
                    "type": "EverspringST812",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 5,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 100,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-0A"
                },
                "00-00-00-00-00-00-00-0B": {
                    "name": "Living Room Siren",
                    "type": "EverspringSE812",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 4.8,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 90,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-0B"
                },
                "00-00-00-00-00-00-00-0C": {
                    "name": "Living Room Smoke and CO Detector",
                    "type": "FirstAlertSmokeCOAlarm",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": 4.76,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 88,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-0C"
                },
                "00-00-00-00-00-00-00-0D": {
                    "name": "Inner Garage Door Sensor",
                    "type": "ContactSensor",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.974,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 100,
                    "mains": false,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": 25.75,
                    "version": "2.8r16",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": "CLOSED",
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "ALREADY_AT_LATEST_VERSION",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-0D"
                },
                "00-00-00-00-00-00-00-0E": {
                    "name": "Dining Window",
                    "type": "ContactSensor",
                    "protocol": [
                        "zigbee"
                    ],
                    "battery": 2.944,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": 5,
                    "batteryPercentage": 100,
                    "mains": false,
                    "power": null,
                    "signal": 0,
                    "presence": true,
                    "temperature": 32,
                    "version": "2.8r16",
                    "latestVersion": "UPGRADE_AVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": true,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "DEVICE_IN_LIMBO",
                    "hardwareRevision": "1.0",
                    "id": "00-00-00-00-00-00-00-0E"
                },
                "00-00-00-00-00-00-00-0F": {
                    "name": "Kitchen Lights",
                    "type": "JascoBinarySwitch",
                    "protocol": [
                        "zwave"
                    ],
                    "battery": null,
                    "batteryLow": false,
                    "lowSignal": null,
                    "batteryLevel": null,
                    "batteryPercentage": null,
                    "mains": true,
                    "power": null,
                    "signal": 100,
                    "presence": true,
                    "temperature": null,
                    "version": "VERSION_UNAVAILABLE",
                    "latestVersion": "VERSION_UNAVAILABLE",
                    "upgradeStatus": "Ok",
                    "isGeneric": false,
                    "hasBattery": false,
                    "state": null,
                    "standalone": false,
                    "upgrade": "INELIGIBLE",
                    "reason": "UPGRADE_NOT_POSSIBLE",
                    "hardwareRevision": "VERSION_UNAVAILABLE",
                    "id": "00-00-00-00-00-00-00-0F"
                }
            };

            //#endregion

            //#region Hub

            hub = {
                "available": true,
                "availableStatus": "HUB_ONLINE",
                "configured": true,
                "hubOs": "1.29",
                "version": "4.02r04",
                "latestVersion": "4.03r09",

                "upgrading": false,
                "upgrade": "ELIGIBLE",

                //"upgrading": true,
                //"upgrade": "ELIGIBLE",

                //"upgrading": false,
                //"upgrade": "INELIGIBLE",
                //"reason": "UPGRADE_NOT_POSSIBLE",

                //"upgrading": false,
                //"upgrade": "INELIGIBLE",
                //"reason": "ALREADY_AT_LATEST_VERSION",

                "powerType": "AC",
                "connectionType": "BROADBAND",
                "onSince": 1406404600,
                "upTime": 7348015,
                "timezone": 0,
                "timezoneName": "America/Los_Angeles",
                "dateInstallDone": 1390785641,
                "daylightSaving": "EU",
                "behaviourId": 77042,
                "behaviourType": "HOME",
                "model": "JUPITER",
                "ip": "192.168.1.30",
                "externalIp": "10.56.0.14",
                "simPresent": false,
                "gprsSignalStrength": null,
                "currentImei": null,
                "currentIccid": null,
                "currentSimId": null,
                "hardwareRevision": "6",
                "battery": "4.1619999999999999",
                "zigbeeNetworkInfo": "25",
                "macAddress": "IHR-048 (00-1C-2B-00-00-00)",
                "zwaveRole": "PRIMARY",
                "rerouteZwaveNetworkStatus": "Failed",
                "name": "Justin's Home",
                "status": "99",
                "simHistory": []
            };

            //#endregion

            return {
                "hub": hub,
                "devices": devices,
                "widgetStatus": "OK",
                "widgetVisible": true
            };
        }

        //#endregion
    }
}
