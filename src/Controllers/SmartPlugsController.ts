module JustinCredible.SmartHomeMobile.Controllers {

    export class SmartPlugsController extends BaseController<ViewModels.SmartPlugsViewModel> {

        //#region Injection

        public static ID = "SmartPlugsController";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.Utilities.ID,
                Services.UiHelper.ID,
                Services.HubDataSource.ID,
                Services.AlertMeApi.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private HubDataSource: Services.HubDataSource,
            private AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.SmartPlugsViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            if (this.HubDataSource.smartPlugs == null
                || this.HubDataSource.smartPlugsLastUpdated == null
                || moment().diff(this.HubDataSource.smartPlugsLastUpdated, "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.smartPlugs = this.HubDataSource.smartPlugs;
                this.viewModel.lastUpdated = this.HubDataSource.smartPlugsLastUpdated.toDate();
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshSmartPlugs().then((result: AlertMeApiTypes.SmartPlugDevice[]) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);

                this.viewModel.smartPlugs = result;
                this.viewModel.lastUpdated = this.HubDataSource.smartPlugsLastUpdated.toDate();

                this.viewModel.originalIntensityValues = {};
                this.viewModel.showIntensityUpdateButton = {};

                // Save off all of the original intensity values.
                this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice) => {
                    if (device.supportsIntensity) {
                        this.viewModel.originalIntensityValues[device.id] = device.intensity;
                    }
                });

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);
            });
        }

        //#endregion

        //#region Attribute/Expression Properties

        protected get allOnButton_disabled(): boolean {
            var devices: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then just return true so the button is disabled.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return true;
            }

            // Filter down to get the lighting and smart plug devices which have on/off states.
            devices = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS" || smartPlug.applianceType === "SMARTPLUG";
            });

            // If all of the devices are on, then then on button should be disabled.
            return _.all(devices, { onOffState: Services.AlertMeApi.SmartPlugOnOffState.On });
        }

        protected get allOffButton_disabled(): boolean {
            var devices: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then just return true so the button is disabled.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return true;
            }

            // Filter down to get the lighting and smart plug devices which have on/off states.
            devices = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS" || smartPlug.applianceType === "SMARTPLUG";
            });

            // If all of the devices are off, then then off button should be disabled.
            return _.all(devices, { onOffState: Services.AlertMeApi.SmartPlugOnOffState.Off });
        }

        protected get lighting_show(): boolean {
            var outlets: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type lighting.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        protected get outlets_show(): boolean {
            var outlets: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type smart plug.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "SMARTPLUG";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        protected get otherDevices(): AlertMeApiTypes.SmartPlugDevice[] {

            // If there is no view model data, then just return an empty array.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return [];
            }

            return _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType !== "LIGHTS" && smartPlug.applianceType !== "SMARTPLUG";
            });
        }

        //protected get intensitySlider_show(device: AlertMeApiTypes.SmartPlugDevice): boolean {
        //    return this.viewModel != null && this.viewModel.showIntensityUpdateButton[device.deviceId];
        //}

        //#endregion

        //#region Events

        protected refresh_click(): void {
            this.refresh();
        }

        protected refresher_refresh(): void {
            this.refresh();
        }

        protected smartPlugToggle_click(device: AlertMeApiTypes.SmartPlugDevice): void {
            var oldOnOffState: string,
                newOnOffState: string;

            // If this device was reported as unavailable, then there is nothing to do.
            if (device.onOffState === Services.AlertMeApi.SmartPlugOnOffState.Unavailable) {
                return;
            }

            // Determine what the original state was. Since we are in the click event
            // the state must have already been changed, therefore the original state
            // is simply the opposite of what is in the model.
            oldOnOffState = device.onOffState === "on" ? Services.AlertMeApi.SmartPlugOnOffState.Off : Services.AlertMeApi.SmartPlugOnOffState.On;

            // Determine what lock state we need to pass to the API call
            // based on the current on/off state (we use the opposite).
            newOnOffState = device.onOffState === "on" ? Services.AlertMeApi.SmartPlugOnOffState.On : Services.AlertMeApi.SmartPlugOnOffState.Off;

            this.AlertMeApi.setSmartPlugState(device.id, newOnOffState).then(() => {
                // If the API call succeeded, set the new on/off state into
                // the view model.
                device.onOffState = newOnOffState;
            }, () => {
                // If the API call failed, then preserve the previous state.
                device.onOffState = oldOnOffState;
            });
        }

        protected intensityRange_change(device: AlertMeApiTypes.SmartPlugDevice): void {
            // Show the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = true;
        }

        protected cancelIntensityChange_click(device: AlertMeApiTypes.SmartPlugDevice): void {
            // Restore the original value.
            device.intensity = this.viewModel.originalIntensityValues[device.id];

            // Hide the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = false;
        }

        protected acceptIntensityChange_click(device: AlertMeApiTypes.SmartPlugDevice): void {

            //TODO: Make the webservice call here.

            // Hide the update section.
            this.viewModel.showIntensityUpdateButton[device.id] = false;
        }

        protected allOn_click(): void {
            var oldOnOffStates: string[] = [];

            // Save this off, so the API call fails, we can set the value back to its original value.
            this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice) => {
                oldOnOffStates.push(device.onOffState);
            });

            this.AlertMeApi.setSmartPlugState("all", Services.AlertMeApi.SmartPlugOnOffState.On).then(() => {
                // If the API call succeeded, set the new on/off state into the view model.
                this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice) => {
                    if (device.onOffState !== Services.AlertMeApi.SmartPlugOnOffState.Unavailable) {
                        device.onOffState = Services.AlertMeApi.SmartPlugOnOffState.On;
                    }
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice, index: number) => {
                    device.onOffState = oldOnOffStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        protected allOff_click(): void {
            var oldOnOffStates: string[] = [];

            // Save this off, so the API call fails, we can set the value back to its original value.
            this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice) => {
                oldOnOffStates.push(device.onOffState);
            });

            this.AlertMeApi.setSmartPlugState("all", Services.AlertMeApi.SmartPlugOnOffState.Off).then(() => {
                // If the API call succeeded, set the new on/off state into the view model.
                this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice) => {
                    if (device.onOffState !== Services.AlertMeApi.SmartPlugOnOffState.Unavailable) {
                        device.onOffState = Services.AlertMeApi.SmartPlugOnOffState.Off;
                    }
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.smartPlugs.forEach((device: AlertMeApiTypes.SmartPlugDevice, index: number) => {
                    device.onOffState = oldOnOffStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        protected setMultiple_click(): void {
            var options: Models.DialogOptions,
                devicesToUpdate: AlertMeApiTypes.SmartPlugDevice[];

            // Initialize the array; this will contain the list of devices that need to be updated.
            devicesToUpdate = [];

            // Pass in the smart plugs array from the view model to the dialog.
            options = new Models.DialogOptions(_.clone(this.viewModel.smartPlugs, true));

            // Show the dialog.
            this.UiHelper.showDialog(SetMultipleSmartPlugsStateController.ID, options).then((result: AlertMeApiTypes.SmartPlugDevice[]) => {

                // If the user cancelled, then do nothing.
                if (result == null) {
                    return;
                }

                result.forEach((potentiallyUpdatedDevice: AlertMeApiTypes.SmartPlugDevice) => {
                    var originalDevice: AlertMeApiTypes.SmartPlugDevice;

                    // Find the original device object by matching on IDs.
                    originalDevice = _.where(this.viewModel.smartPlugs, { id: potentiallyUpdatedDevice.id })[0];

                    // If the on/off states no longer match (ie they were changed by the user inside
                    // of the dialog) then make a call to update its state.
                    if (potentiallyUpdatedDevice.onOffState !== Services.AlertMeApi.SmartPlugOnOffState.Unavailable &&
                        originalDevice.onOffState !== potentiallyUpdatedDevice.onOffState) {
                        this.AlertMeApi.setSmartPlugState(potentiallyUpdatedDevice.id, potentiallyUpdatedDevice.onOffState).then(() => {
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
