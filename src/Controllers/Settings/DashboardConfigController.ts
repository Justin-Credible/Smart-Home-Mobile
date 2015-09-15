module JustinCredible.SmartHomeMobile.Controllers {

    export class DashboardConfigController extends BaseController<ViewModels.DashboardConfigViewModel> {

        //#region Injection

        public static ID = "DashboardConfigController";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.Utilities.ID,
                Services.UiHelper.ID,
                Services.HubDataSource.ID,
                Services.Preferences.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private HubDataSource: Services.HubDataSource,
            private Preferences: Services.Preferences) {
            super($scope, ViewModels.DashboardConfigViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.viewModel.floorplanImageUrl = this.Preferences.dashboardFloorplanImageUrl;
            this.viewModel.hasChanges = false;
            this.viewModel.showToolbar = true;

            let items = this.Preferences.dashboardItems;

            if (items) {
                this.viewModel.items = items;
            }
            else {
                this.refreshDeviceList();
            }
        }

        //#endregion

        //#region Private Methods

        private getDeviceDictionary(dashboardDevices: Models.DashboardDevices): Models.Dictionary<AlertMeApiTypes.DeviceDescriptor> {

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

        private getItemsDictionary(items: Models.DashboardItem[]): Models.Dictionary<Models.DashboardItem> {

            var dictionary: Models.Dictionary<Models.DashboardItem> = {};

            if (!items) {
                return dictionary;
            }

            items.forEach((item: Models.DashboardItem) => {
                dictionary[item.deviceId] = item;
            });

            return dictionary;
        }

        private refreshDeviceList(): void {

            this.HubDataSource.refreshDashboardDevices().then((dashboardDevices: Models.DashboardDevices) => {

                if (!this.viewModel.items) {
                    this.viewModel.items = [];
                }

                // Flatten the different device types into a single dictionary of devices by ID.
                let deviceList = this.getDeviceDictionary(dashboardDevices);

                // Flatten the items list into a dictionary of items by device ID.
                let itemsList = this.getItemsDictionary(this.viewModel.items);

                // Keeps track of the X coordiate for new items so they don't all overlap.
                let newItemPositionCounter = 0;

                // Keeps track of if a changed has occurred or not.
                let hasChanged = false;

                // First, loop over each of the devices and add items if they don't exist yet.
                Object.keys(deviceList).forEach((deviceId: string) => {

                    if (itemsList[deviceId]) {
                        // Device already has a corresponding item, so we'll update it.
                        itemsList[deviceId].name = deviceList[deviceId].name;
                        itemsList[deviceId].missing = false;
                        hasChanged = true;
                    }
                    else {
                        // If this is a new device, add an item for it.
                        let newItem = new Models.DashboardItem();
                        newItem.deviceId = deviceId;
                        newItem.type = deviceList[deviceId].type;
                        newItem.name = deviceList[deviceId].name;
                        newItem.visible = true;
                        newItem.missing = false;

                        newItem.x = newItemPositionCounter += 10;
                        newItem.y = 45;

                        itemsList[deviceId] = newItem;

                        hasChanged = true;
                    }
                });

                // Look for items whose devices are no longer present.
                Object.keys(itemsList).forEach((deviceId: string) => {

                    if (!deviceList[deviceId]) {
                        itemsList[deviceId].missing = true;
                        hasChanged = true;
                    }
                });

                this.viewModel.items = [];

                // Convert back to an array for the view model.
                Object.keys(itemsList).forEach((deviceId: string) => {
                    this.viewModel.items.push(itemsList[deviceId]);
                });

                if (hasChanged) {
                    this.viewModel.hasChanges = true;
                }
            });
        }

        //#endregion

        //#region Attribute/Expression Properties and Helpers

        protected getIconForItem(item: Models.DashboardItem): string {

            if (!item || !item.type) {
                return "ion-help";
            }

            switch (item.type) {
                case "SmartPlug":
                case "JascoOutdoorModule":
                    return "ion-outlet";
                case "GenericMultilevelSwitch":
                case "JascoBinarySwitch":
                    return "ion-ios-lightbulb-outline";
                case "DEADBOLT":
                    return "ion-ios-locked";
                case "ContactSensor":
                    return "ion-checkmark-round";
                default:
                    return "ion-help";
            }
        }

        protected getBackgroundImageUrl(): string {
            return this.viewModel.floorplanImageUrl || "";
        }

        //#endregion

        //#region Events

        protected toggleToolbar_click(): void {
            this.viewModel.showToolbar = !this.viewModel.showToolbar;
        }

        protected refreshDevices_click(): void {
            this.refreshDeviceList();
        }

        protected resetLayout_click(): void {

        let message = "Are you sure you want to reset the layout of all of the devices?";
            let title = "Reset Layout";

            this.UiHelper.confirm(message, title).then((result: string) => {

                if (result === Constants.Buttons.No) {
                    return;
                }

                // Keeps track of the X coordiate for new items so they don't all overlap.
                let newItemPositionCounter = 0;

                this.viewModel.items.forEach((item: Models.DashboardItem) => {
                    item.x = newItemPositionCounter += 10;
                    item.y = 45;
                });

                this.viewModel.hasChanges = true;
            });
        }

        protected setFloorplanImage_click(): void {
            let message = "Enter the URL to an image to use for the dashboard floorplan.";
            let title = "Set Floorplan Image";

            this.UiHelper.prompt(message, title, null, this.viewModel.floorplanImageUrl)
                .then((result: Models.KeyValuePair<string, string>) => {

                if (result.key === Constants.Buttons.OK) {
                    this.viewModel.floorplanImageUrl = result.value;
                }
            });
        }

        protected save_click(): void {
            let message = "Are you sure you want to save the dashboard configuration?";

            this.UiHelper.confirm(message).then((result: string) => {
                if (result === Constants.Buttons.Yes) {
                    this.Preferences.dashboardItems = this.viewModel.items;
                    this.Preferences.dashboardFloorplanImageUrl = this.viewModel.floorplanImageUrl;
                    this.viewModel.hasChanges = false;
                    this.UiHelper.alert("Dashboard configuration saved!");
                }
            });
        }

        protected item_click(item: Models.DashboardItem): void {
            this.viewModel.selectedItem = item;
        }

        protected remove_click(item: Models.DashboardItem): void {
            let message = this.Utilities.format("Are you sure you want remove the following missing device?\n\n{0}", item.name);

            this.UiHelper.confirm(message).then((result: string) => {
                if (result === Constants.Buttons.Yes) {
                    _.remove(this.viewModel.items, { deviceId: item.deviceId });
                    this.viewModel.selectedItem = null;
                    this.viewModel.hasChanges = true;
                    this.UiHelper.alert("Device removed.");
                }
            });
        }

        //#endregion
    }
}
