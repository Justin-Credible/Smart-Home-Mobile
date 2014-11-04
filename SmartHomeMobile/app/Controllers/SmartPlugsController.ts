module JustinCredible.SmartHomeMobile.Controllers {

    export interface ISmartPlugsController {
        viewModel: ViewModels.SmartPlugsViewModel;
    }

    export class SmartPlugsController extends BaseController<ViewModels.SmartPlugsViewModel> implements ISmartPlugsController {

        public static $inject = ["$scope", "Utilities", "UiHelper", "IrisDataSource", "IrisApi"];

        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private IrisDataSource: Services.IrisDataSource;
        private IrisApi: Services.IrisApi;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, UiHelper: Services.UiHelper, IrisDataSource: Services.IrisDataSource, IrisApi: Services.IrisApi) {
            super($scope, ViewModels.SmartPlugsViewModel);

            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.IrisDataSource = IrisDataSource;
            this.IrisApi = IrisApi;
        }

        //#region Controller Events

        public initialize() {

            if (this.IrisDataSource.smartPlugs == null
                || this.IrisDataSource.smartPlugsLastUpdated == null
                || this.IrisDataSource.smartPlugsLastUpdated.diff(moment(), "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.smartPlugs = this.IrisDataSource.smartPlugs;
                this.viewModel.lastUpdated = this.IrisDataSource.smartPlugsLastUpdated.toDate();
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.IrisDataSource.refreshSmartPlugs().then((result: IrisApiTypes.SmartPlugDevice[]) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");

                this.viewModel.smartPlugs = result;
                this.viewModel.lastUpdated = this.IrisDataSource.smartPlugsLastUpdated.toDate();

                this.viewModel.originalIntensityValues = {};
                this.viewModel.showIntensityUpdateButton = {};

                // Save off all of the original intensity values.
                this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice) => {
                    if (device.supportsIntensity) {
                        this.viewModel.originalIntensityValues[device.id] = device.intensity;
                    }
                });

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");
            });
        }

        //#endregion

        //#region Attribute/Expression Properties

        get allOnButton_disabled(): boolean {
            var devices: IrisApiTypes.SmartPlugDevice[];

            // If there is no view model data, then just return true so the button is disabled.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return true;
            }

            // Filter down to get the lighting and smart plug devices which have on/off states.
            devices = _.filter(this.viewModel.smartPlugs, (smartPlug: IrisApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS" || smartPlug.applianceType === "SMARTPLUG";
            });

            // If all of the devices are on, then then on button should be disabled.
            return _.all(devices, { onOffState: Services.IrisApi.SmartPlugOnOffState.On });
        }

        get allOffButton_disabled(): boolean {
            var devices: IrisApiTypes.SmartPlugDevice[];

            // If there is no view model data, then just return true so the button is disabled.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return true;
            }

            // Filter down to get the lighting and smart plug devices which have on/off states.
            devices = _.filter(this.viewModel.smartPlugs, (smartPlug: IrisApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS" || smartPlug.applianceType === "SMARTPLUG";
            });

            // If all of the devices are off, then then off button should be disabled.
            return _.all(devices, { onOffState: Services.IrisApi.SmartPlugOnOffState.Off });
        }

        get lighting_show(): boolean {
            var outlets: IrisApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type lighting.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: IrisApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        get outlets_show(): boolean {
            var outlets: IrisApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type smart plug.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: IrisApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "SMARTPLUG";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        get otherDevices(): IrisApiTypes.SmartPlugDevice[] {

            // If there is no view model data, then just return an empty array.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return [];
            }

            return _.filter(this.viewModel.smartPlugs, (smartPlug: IrisApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType !== "LIGHTS" && smartPlug.applianceType !== "SMARTPLUG";
            });
        }

        //get intensitySlider_show(device: IrisApiTypes.SmartPlugDevice): boolean {
        //    return this.viewModel != null && this.viewModel.showIntensityUpdateButton[device.deviceId];
        //}

        //#endregion

        //#region Events

        public refresh_click(): void {
            this.refresh();
        }

        public refresher_refresh(): void {
            this.refresh();
        }

        public smartPlugToggle_click(device: IrisApiTypes.SmartPlugDevice): void {
            var oldOnOffState: string,
                newOnOffState: string;

            // Save this off, so the API call fails, we can set the value
            // back to its original value.
            oldOnOffState = device.onOffState;

            // Determine what lock state we need to pass to the API call
            // based on the current on/off state (we use the opposite).
            newOnOffState = device.onOffState === "on" ? Services.IrisApi.SmartPlugOnOffState.Off : Services.IrisApi.SmartPlugOnOffState.On;

            this.IrisApi.setSmartPlugState(device.id, newOnOffState).then(() => {
                // If the API call succeeded, set the new on/off state into
                // the view model.
                device.onOffState = newOnOffState;
            }, () => {
                // If the API call failed, then preserve the previous state.
                device.onOffState = oldOnOffState;
            });
        }

        public intensityRange_change(device: IrisApiTypes.SmartPlugDevice): void {
            // Show the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = true;
        }

        public cancelIntensityChange_click(device: IrisApiTypes.SmartPlugDevice): void {
            // Restore the original value.
            device.intensity = this.viewModel.originalIntensityValues[device.id];

            // Hide the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = false;
        }

        public acceptIntensityChange_click(device: IrisApiTypes.SmartPlugDevice): void {

            //TODO: Make the webservice call here.

            // Hide the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = false;
        }

        public allOn_click(): void {
            var oldOnOffStates: string[] = [];

            // Save this off, so the API call fails, we can set the value back to its original value.
            this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice) => {
                oldOnOffStates.push(device.onOffState);
            });

            this.IrisApi.setSmartPlugState("all", Services.IrisApi.SmartPlugOnOffState.On).then(() => {
                // If the API call succeeded, set the new on/off state into the view model.
                this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice) => {
                    device.onOffState = Services.IrisApi.SmartPlugOnOffState.On;
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice, index: number) => {
                    device.onOffState = oldOnOffStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        public allOff_click(): void {
            var oldOnOffStates: string[] = [];

            // Save this off, so the API call fails, we can set the value back to its original value.
            this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice) => {
                oldOnOffStates.push(device.onOffState);
            });

            this.IrisApi.setSmartPlugState("all", Services.IrisApi.SmartPlugOnOffState.On).then(() => {
                // If the API call succeeded, set the new on/off state into the view model.
                this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice) => {
                    device.onOffState = Services.IrisApi.SmartPlugOnOffState.On;
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.smartPlugs.forEach((device: IrisApiTypes.SmartPlugDevice, index: number) => {
                    device.onOffState = oldOnOffStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        public setMultiple_click(): void {
            var options: Models.DialogOptions,
                devicesToUpdate: IrisApiTypes.SmartPlugDevice[];

            // Initialize the array; this will contain the list of devices that need to be updated.
            devicesToUpdate = [];

            // Pass in the smart plugs array from the view model to the dialog.
            options = new Models.DialogOptions(_.clone(this.viewModel.smartPlugs));

            // Show the dialog.
            this.UiHelper.showDialog(this.UiHelper.DialogIds.SetMultipleSmartPlugsState, options).then((result: IrisApiTypes.SmartPlugDevice[]) => {

                // If the user cancelled, then do nothing.
                if (result == null) {
                    return;
                }

                result.forEach((potentiallyUpdatedDevice: IrisApiTypes.SmartPlugDevice) => {
                    var originalDevice: IrisApiTypes.SmartPlugDevice;

                    // Find the original device object by matching on IDs.
                    originalDevice = _.where(this.viewModel.smartPlugs, { id: potentiallyUpdatedDevice.id })[0];

                    // If the on/off states no longer match (ie they were changed by the user inside
                    // of the dialog) then make a call to update its state.
                    if (originalDevice.onOffState !== potentiallyUpdatedDevice.onOffState) {
                        this.IrisApi.setSmartPlugState(potentiallyUpdatedDevice.id, potentiallyUpdatedDevice.onOffState).then(() => {
                            // If the update succeeded, then update the on/off state for the device
                            // on the view model.
                            originalDevice.onOffState = potentiallyUpdatedDevice.onOffState;
                        });
                    }
                });
            });
        }

        //#endregion
    }
}