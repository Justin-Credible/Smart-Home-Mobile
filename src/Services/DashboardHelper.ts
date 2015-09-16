module JustinCredible.SmartHomeMobile.Services {

    export class DashboardHelper {

        //#region Injection

        public static ID = "DashboardHelper";

        public static get $inject(): string[] {
            return [];
        }

        constructor() {
            /* tslint:disable:no-empty */
            /* tslint:enable:no-empty */
        }

        //#endregion

        /**
         * Used to convert an array of dashboard items to a dictionary of said items
         * using the device ID as the dictionary key. Allows for fast indexing to
         * find an item by its device ID.
         * 
         * @param items An array of dashboard items.
         * @returns A dictionary of dashboard items indexed by device ID.
         */
        public getItemsDictionary(items: Models.DashboardItem[]): Models.Dictionary<Models.DashboardItem> {

            var dictionary: Models.Dictionary<Models.DashboardItem> = {};

            if (!items) {
                return dictionary;
            }

            items.forEach((item: Models.DashboardItem) => {
                dictionary[item.deviceId] = item;
            });

            return dictionary;
        }

        /**
         * Used to flatten the tree of different devices into a flat dictionary of
         * device ID to device.
         * 
         * @param dashboardDevice The collection of dashboard devices to flatten.
         * @returns A dictionary of devices with the key being the device ID.
         */
        public getDeviceDictionary(dashboardDevices: Models.DashboardDevices): Models.Dictionary<AlertMeApiTypes.DeviceDescriptor> {

            var dictionary: Models.Dictionary<AlertMeApiTypes.DeviceDescriptor> = {};

            if (!dashboardDevices) {
                return dictionary;
            }

            var otherDeviceIds = Object.keys(dashboardDevices.alarmOverviewData.otherDevices);

            otherDeviceIds.forEach((deviceId: string, index: number) => {
                let otherDevice = dashboardDevices.alarmOverviewData.otherDevices[deviceId];

                if (otherDevice.type === "ContactSensor") {
                    dictionary[deviceId] = otherDevice;
                }
            });

            dashboardDevices.lockData.locks.forEach((lockDevice: AlertMeApiTypes.LockDevice) => {
                dictionary[lockDevice.id] = lockDevice;
            });

            dashboardDevices.smartPlugs.forEach((smartPlugDevice: AlertMeApiTypes.SmartPlugDevice) => {
                dictionary[smartPlugDevice.id] = smartPlugDevice;
            });

            return dictionary;
        }

        public getIconForItem(item: Models.DashboardItem, device: AlertMeApiTypes.DeviceDescriptor): string {

            if (!item || !item.type || !device) {
                return "ion-help";
            }

            switch (item.type) {
                case "SmartPlug":
                case "JascoOutdoorModule":
                    return "ion-outlet";

                case "GenericMultilevelSwitch":
                case "JascoBinarySwitch": {
                    let smartPlug = <AlertMeApiTypes.SmartPlugDevice> device;

                    if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.Off) {
                        return "ion-ios-lightbulb-outline";
                    }
                    else if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.On) {
                        return "ion-ios-lightbulb";
                    }
                    else {
                        return "ion-help";
                    }
                }
                break;

                case "DEADBOLT": {
                    let lock = <AlertMeApiTypes.LockDevice> device;

                    if (lock.lockState === AlertMeApi.LockState.Locked) {
                        return "ion-ios-locked";
                    }
                    else if (lock.lockState === AlertMeApi.LockState.Unlocked) {
                        return "ion-ios-unlocked-outline";
                    }
                    else {
                        return "ion-help";
                    }
                }
                break;

                case "ContactSensor": {
                    let sensor = <AlertMeApiTypes.AlarmDevice> device;

                    if (sensor.state === AlertMeApi.ContactSensorState.Closed) {
                        return "ion-checkmark-round";
                    }
                    else if (sensor.state === AlertMeApi.ContactSensorState.Opened) {
                        return "ion-close-round";
                    }
                    else {
                        return "ion-help";
                    }
                }
                break;

                default:
                    return "ion-help";
            }

            return "ion-help";
        }

        public getColorForItem(item: Models.DashboardItem, device: AlertMeApiTypes.DeviceDescriptor): string {

            if (!item || item.missing || !device) {
                return "#444";
            }

            switch (item.type) {
                case "SmartPlug":
                case "JascoOutdoorModule": {
                    let smartPlug = <AlertMeApiTypes.SmartPlugDevice> device;

                    if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.Off) {
                        return "#444";
                    }
                    else if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.On) {
                        return "##ffc900"; // Ionic "Energized"
                    }
                    else {
                        return "#444";
                    }
                }
               break;

                case "GenericMultilevelSwitch":
                case "JascoBinarySwitch": {
                    let smartPlug = <AlertMeApiTypes.SmartPlugDevice> device;

                    if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.Off) {
                        return "#444";
                    }
                    else if (smartPlug.onOffState === AlertMeApi.SmartPlugOnOffState.On) {
                        return "##ffc900"; // Ionic "Energized"
                    }
                    else {
                        return "#444";
                    }
                }
                break;

                case "DEADBOLT": {
                    let lock = <AlertMeApiTypes.LockDevice> device;

                    if (lock.lockState === AlertMeApi.LockState.Locked) {
                        return "#444";
                    }
                    else if (lock.lockState === AlertMeApi.LockState.Unlocked) {
                        return "#ef473a"; // Ionic "Assertive"
                    }
                    else {
                        return "#444";
                    }
                }
                break;

                case "ContactSensor": {
                    let sensor = <AlertMeApiTypes.AlarmDevice> device;

                    if (sensor.state === AlertMeApi.ContactSensorState.Closed) {
                        return "#444";
                    }
                    else if (sensor.state === AlertMeApi.ContactSensorState.Opened) {
                        return "#ef473a"; // Ionic "Assertive"
                    }
                    else {
                        return "#444";
                    }
                }
                break;

                default:
                    return "#444";
            }

            return "#444";
        }

        public getBorderColorForItem(item: Models.DashboardItem, device: AlertMeApiTypes.DeviceDescriptor): string {
            return !item || item.missing || !device ? "red" :  "#444";
        }
    }
}
