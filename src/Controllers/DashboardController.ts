module JustinCredible.SmartHomeMobile.Controllers {

    export class DashboardController extends BaseController<ViewModels.DashboardViewModel> {

        //#region Injection

        public static ID = "DashboardController";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.Utilities.ID,
                Services.UiHelper.ID,
                Services.Preferences.ID,
                Services.DashboardHelper.ID,
                Services.HubDataSource.ID,
                Services.AlertMeApi.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private Preferences: Services.Preferences,
            private DashboardHelper: Services.DashboardHelper,
            private HubDataSource: Services.HubDataSource,
            private AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.DashboardViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.viewModel.floorplanImageUrl = this.Preferences.dashboardFloorplanImageUrl;
            this.viewModel.items = this.Preferences.dashboardItems;

            if (this.HubDataSource.dashboardDevices == null
                || this.HubDataSource.dashboardDevicesLastUpdated == null
                || moment().diff(this.HubDataSource.dashboardDevicesLastUpdated, "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(this.HubDataSource.dashboardDevices);
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshDashboardDevices().then((result: Models.DashboardDevices) => {
                this.viewModel.isRefreshing = false;
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(result);
                this.viewModel.lastUpdated = this.HubDataSource.dashboardDevicesLastUpdated.toDate();
            }, () => {
                this.viewModel.isRefreshing = false;
            });
        }

        protected toggleSmartPlug(item: Models.DashboardItem, device: AlertMeApiTypes.SmartPlugDevice): void {
            var newOnOffState: string;

            // If this device was reported as unavailable, then there is nothing to do.
            if (device.onOffState === Services.AlertMeApi.SmartPlugOnOffState.Unavailable) {
                return;
            }

            // Determine what lock state we need to pass to the API call
            // based on the current on/off state (we use the opposite).
            newOnOffState = device.onOffState === Services.AlertMeApi.SmartPlugOnOffState.Off
                                ? Services.AlertMeApi.SmartPlugOnOffState.On
                                : Services.AlertMeApi.SmartPlugOnOffState.Off;

            // Set the flag so we can show a spinner on the dashboard item.
            item.isBusy = true;

            this.AlertMeApi.setSmartPlugState(device.id, newOnOffState, false)
                .then(() => {
                    // If the API call succeeded, set the new on/off state into the view model.
                    device.onOffState = newOnOffState;
                }).finally(() => {
                    item.isBusy = false;
                });
        }

        protected toggleLock(item: Models.DashboardItem, device: AlertMeApiTypes.LockDevice): void {
            var newLockState: string;

            // Determine what lock state we need to pass to the API call
            // based on the current lock state (we use the opposite).
            newLockState = device.lockState === Services.AlertMeApi.LockState.Locked
                                ? Services.AlertMeApi.LockState.Unlocked
                                : Services.AlertMeApi.LockState.Locked;

            // Set the flag so we can show a spinner on the dashboard item.
            item.isBusy = true;

            this.AlertMeApi.setLockState(device.id, newLockState, false)
                .then(() => {
                    // If the API call succeeded, set the new lock state into the view model.
                    device.lockState = newLockState;
                }).finally(() => {
                    item.isBusy = false;
                });
        }

        //#endregion

        //#region Attribute/Expression Properties and Helpers

        public getIconForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getIconForItem(item, device);
        }

        public getColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getColorForItem(item, device);
        }

        public getBorderColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getBorderColorForItem(item, device);
        }

        //#endregion

        //#region Events

        protected refresh_click(): void {
            this.refresh();
        }

        protected item_click(item: Models.DashboardItem): void {

            // Sanity check.
            if (!item || !item.deviceId) {
                return;
            }

            // Sanity check.
            if (!this.viewModel.devices) {
                return;
            }

            // Make sure the user can't send a request if the device is busy.
            if (item.isBusy) {
                this.UiHelper.toast.showShortBottom("The device is busy; please try again later.");
                return;
            }

            // Grab the device for this dashboard item.
            let device = this.viewModel.devices[item.deviceId];

            // If a device isn't available alert the user.
            if (item.missing || !device) {
                let message = this.Utilities.format("The device '{0}' of type '{1}' with ID '{2}' could not be located; check your hub configuration and device status.",
                                    item.name,
                                    item.type,
                                    item.deviceId);

                this.UiHelper.alert(message, "Device Missing");
                return;
            }

            // Sanity check--this shouldn't be possible.
            if (item.type !== device.type) {
                let message = this.Utilities.format("The type of the dashboard item '{0}' does not match the device type '{1}'; you may need to refresh your dashboard devices via Settings.",
                                    item.type,
                                    device.type);

                this.UiHelper.alert(message, "Device Type Mismatch");
                return;
            }

            switch (item.type) {
                case "SmartPlug":
                case "JascoOutdoorModule":
                case "GenericMultilevelSwitch":
                case "JascoBinarySwitch":
                    this.toggleSmartPlug(item, <AlertMeApiTypes.SmartPlugDevice>device);
                    break;

                case "DEADBOLT":
                    this.toggleLock(item, <AlertMeApiTypes.LockDevice>device);
                    break;

                case "ContactSensor": {
                    let sensor = <AlertMeApiTypes.AlarmDevice> device;

                    let message = this.Utilities.format("This contact sensor is currently {0}.",
                                        this.Utilities.toTitleCase(sensor.state));

                    this.UiHelper.toast.showShortCenter(message);
                }
                break;

                default: {
                    let message = this.Utilities.format("This device ('{0}') is of type '{1}' which is not supported.",
                                        item.name,
                                        item.type);

                    this.UiHelper.alert(message, "Unsupported Device Type");
                }
            }
        }

        //#endregion
    }
}
