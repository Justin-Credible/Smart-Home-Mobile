module JustinCredible.SmartHomeMobile.Controllers {

    export class ThermostatController extends BaseController<ViewModels.ThermostatViewModel> {

        //#region Injection

        public static ID = "ThermostatController";

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
            super($scope, ViewModels.ThermostatViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            if (this.HubDataSource.climate == null
                || this.HubDataSource.climateLastUpdated == null
                || moment().diff(this.HubDataSource.climateLastUpdated, "minutes") > 10) {
                this.refresh();
            }
            else {
                this.populateViewModel(this.HubDataSource.climate, this.HubDataSource.climateLastUpdated);
            }
        }

        //#endregion

        //#region Private Methods

        private populateViewModel(climate: AlertMeApiTypes.ClimateGetResult, climateLastUpdated: moment.Moment): void {

            this.viewModel.climate = climate;
            this.viewModel.lastUpdated = climateLastUpdated.toDate();

            // If the state or mode is OFF then the target temperature will return "--" instead of null.
            if (typeof(this.viewModel.climate.targetTemperature) === "number") {
                this.viewModel.newTargetTemperature = this.viewModel.climate.targetTemperature;
                this.viewModel.temperatureSliderValue = this.viewModel.climate.targetTemperature + "";
            }
            else {
                this.viewModel.newTargetTemperature = null;
            }

            this.viewModel.newOnOffState = this.viewModel.climate.onOffState;
            this.viewModel.newMode = this.viewModel.climate.mode;

            this.viewModel.changesMade = false;
        }

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshClimate().then((result: AlertMeApiTypes.ClimateGetResult) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);

                if (result.widgetStatus === Services.AlertMeApi.WidgetStatus.DeviceMissing) {
                    this.UiHelper.toast.showLongBottom(result.message);
                }

                this.populateViewModel(result, this.HubDataSource.climateLastUpdated);

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);
            });
        }

        //#endregion

        //#region Controller Events

        protected refresh_click(): void {
            this.refresh();
        }

        protected refresher_refresh(): void {
            this.refresh();
        }

        protected cool_click(): void {

            // If we are going from OFF to ON, then the target temperature wasn't set, so we'll
            // default it here to be whatever the active temperature is.
            if (this.viewModel.newTargetTemperature == null) {
                this.viewModel.newTargetTemperature = this.viewModel.climate.currentTemperature;
                this.viewModel.temperatureSliderValue = this.viewModel.climate.currentTemperature + "";
            }

            this.viewModel.newOnOffState = Services.AlertMeApi.ClimateOnOffState.On;
            this.viewModel.newMode = Services.AlertMeApi.ClimateMode.Cool;

            this.viewModel.changesMade = true;
        }

        protected heat_click(): void {

            // If we are going from OFF to ON, then the target temperature wasn't set, so we'll
            // default it here to be whatever the active temperature is.
            if (this.viewModel.newTargetTemperature == null) {
                this.viewModel.newTargetTemperature = this.viewModel.climate.currentTemperature;
                this.viewModel.temperatureSliderValue = this.viewModel.climate.currentTemperature + "";
            }

            this.viewModel.newOnOffState = Services.AlertMeApi.ClimateOnOffState.On;
            this.viewModel.newMode = Services.AlertMeApi.ClimateMode.Heat;

            this.viewModel.changesMade = true;
        }

        protected off_click(): void {
            this.viewModel.newTargetTemperature = null;
            this.viewModel.newOnOffState = Services.AlertMeApi.ClimateOnOffState.Off;
            this.viewModel.newMode = Services.AlertMeApi.ClimateMode.Off;

            this.viewModel.changesMade = true;
        }

        protected temperatureRange_change(): void {
            this.viewModel.changesMade = true;

            // The range input binds values as strings; here we ensure it gets parsed back into an number.
            this.viewModel.newTargetTemperature = parseInt(this.viewModel.temperatureSliderValue, 10);
        }

        protected down_click(): void {
            if (this.viewModel.newTargetTemperature > this.viewModel.climate.minTargetTemperature) {
                this.viewModel.newTargetTemperature -= 1;
                this.viewModel.changesMade = true;
            }
        }

        protected up_click(): void {
            if (this.viewModel.newTargetTemperature < this.viewModel.climate.maxTargetTemperature) {
                this.viewModel.newTargetTemperature += 1;
                this.viewModel.changesMade = true;
            }
        }

        protected set_click(device: AlertMeApiTypes.SmartPlugDevice): void {
            var deviceId: string,
                temperatureUnit: string,
                errorHandler;

            deviceId = this.viewModel.climate.deviceId;
            temperatureUnit = Services.AlertMeApi.ClimateTemperatureUnit.Fahrenheit; //TODO Move to preferences.

            // This is a shared error handler for all of the callbacks. If anything goes wrong, lets update
            // the view's data so the user can see what the actual state of the device is.
            errorHandler = () => {
                this.refresh();
            };

            if (this.viewModel.newMode !== this.viewModel.climate.mode
                && this.viewModel.newMode === Services.AlertMeApi.ClimateMode.Off) {

                // Mode has changed to OFF.
                // On/off state doesn't matter (see note below).
                // Target temperature doesn't matter.

                // NOTE: When a mode changes, the AlertMe API also takes care of setting the correct on/off.
                // state. Therefore we only have to make a call to set the mode, and not the on/off state.

                this.AlertMeApi.setClimateMode(deviceId, Services.AlertMeApi.ClimateMode.Off).then((result: AlertMeApiTypes.ClimateModePutResult) => {

                    // Sanity check-- if the call succeeded, but the new mode isn't the mode we set then
                    // who knows what happened. Treat this as an error case.
                    if (result.mode !== Services.AlertMeApi.ClimateMode.Off) {
                        errorHandler();
                        return;
                    }

                    // If everything went okay, then update the on/off flag in the climate model.
                    this.viewModel.climate.onOffState = Services.AlertMeApi.ClimateOnOffState.Off;

                }, errorHandler);
            }
            else if (this.viewModel.newMode !== this.viewModel.climate.mode
                && (this.viewModel.newMode === Services.AlertMeApi.ClimateMode.Cool
                || this.viewModel.newMode === Services.AlertMeApi.ClimateMode.Heat)) {

                // Mode has changed to HEAT or COOL.
                // On/off state doesn't matter (see note below).
                // Target temperature doesn't matter.

                // NOTE: When a mode changes, the AlertMe API also takes care of setting the correct on/off.
                // state. Therefore we only have to make a call to set the mode, and not the on/off state.

                this.AlertMeApi.setClimateMode(deviceId, this.viewModel.newMode).then((result: AlertMeApiTypes.ClimateModePutResult) => {

                    // Sanity check-- if the call succeeded, but the new mode isn't the mode we set then
                    // who knows what happened. Treat this as an error case.
                    if (result.mode !== this.viewModel.newMode) {
                        errorHandler();
                        return;
                    }

                    // If everything went okay, then update the on/off flag in the climate model.
                    this.viewModel.climate.onOffState = this.viewModel.newMode;

                    // Now check to see if the target temperature needs to be updated.
                    if (this.viewModel.newTargetTemperature !== this.viewModel.climate.targetTemperature) {

                        // We wait for a short period before kicking off this API because of what appears to be
                        // a bug with the AlertMe API and/or hub communication with the thermostat device. If
                        // the set mode and set target temperature calls are made too quickly, sometimes the
                        // temperature isn't set even though the call has a 200 result. This fixes issue #13.
                        setTimeout(() => {
                            this.AlertMeApi.setClimateTargetTemperature(deviceId, this.viewModel.newTargetTemperature, temperatureUnit).then(() => {
                                // The update was successful, so update the target temperature in the view model.
                                this.viewModel.climate.targetTemperature = this.viewModel.newTargetTemperature;
                                this.scope.$apply();
                            }, errorHandler);
                        }, 2000);
                    }

                }, errorHandler);
            }
            else if (this.viewModel.newOnOffState !== this.viewModel.climate.onOffState
                && this.viewModel.newOnOffState === Services.AlertMeApi.ClimateOnOffState.Off) {

                // Mode has stayed the same.
                // On/off state changed from ON to OFF.
                // Target temperature doesn't matter.

                this.AlertMeApi.setClimateOnOffState(deviceId, Services.AlertMeApi.ClimateOnOffState.Off).then(() => {
                    // If everything went okay, then update the on/off flag in the climate model.
                    this.viewModel.climate.onOffState = Services.AlertMeApi.ClimateOnOffState.Off;
                }, errorHandler);
            }
            else if (this.viewModel.newOnOffState !== this.viewModel.climate.onOffState
                && this.viewModel.newOnOffState === Services.AlertMeApi.ClimateOnOffState.On) {

                // Mode has stayed the same.
                // On/off state changed from OFF to ON.
                // Target temperature has been chosen.

                this.AlertMeApi.setClimateOnOffState(deviceId, Services.AlertMeApi.ClimateOnOffState.On).then(() => {
                    // If everything went okay, then update the on/off flag in the climate model.
                    this.viewModel.climate.onOffState = Services.AlertMeApi.ClimateOnOffState.Off;

                    // We wait for a short period before kicking off this API because of what appears to be
                    // a bug with the AlertMe API and/or hub communication with the thermostat device. If
                    // the set mode and set target temperature calls are made too quickly, sometimes the
                    // temperature isn't set even though the call has a 200 result. This fixes issue #13.
                    setTimeout(() => {
                        // Since in the OFF state we don't know what the previous target temperature was,
                        // we don't know if the new target temperature is the same or different. So here
                        // we make a unconditional call to set the target temperature.
                        this.AlertMeApi.setClimateTargetTemperature(deviceId, this.viewModel.newTargetTemperature, temperatureUnit).then(() => {
                            // If everything went okay, then update the target temperature in the climate model.
                            this.viewModel.climate.targetTemperature = this.viewModel.newTargetTemperature;
                        }, errorHandler);
                    }, 2000);

                }, errorHandler);
            }
            else if (this.viewModel.climate.onOffState === Services.AlertMeApi.ClimateOnOffState.On
                && this.viewModel.newTargetTemperature
                && this.viewModel.newTargetTemperature !== this.viewModel.climate.targetTemperature) {

                // Mode has stayed the same.
                // On/off state has stayed the same.
                // Target temperature changed.

                // Make a call to set the target temperature.
                this.AlertMeApi.setClimateTargetTemperature(deviceId, this.viewModel.newTargetTemperature, temperatureUnit).then(() => {
                    // The update was successful, so update the target temperature in the view model.
                    this.viewModel.climate.targetTemperature = this.viewModel.newTargetTemperature;
                }, errorHandler);
            }

            // Whatever the outcome, we can hide the ok/cancel buttons at this point.
            this.viewModel.changesMade = false;
        }

        protected cancel_click(device: AlertMeApiTypes.SmartPlugDevice): void {
            this.viewModel.changesMade = false;

            this.viewModel.newOnOffState = this.viewModel.climate.onOffState;
            this.viewModel.newMode = this.viewModel.climate.mode;

            // If the state or mode is OFF then the target temperature will return "--" instead of null.
            if (typeof (this.viewModel.climate.targetTemperature) === "number") {
                this.viewModel.newTargetTemperature = this.viewModel.climate.targetTemperature;
                this.viewModel.temperatureSliderValue = this.viewModel.newTargetTemperature + "";
            }
            else {
                this.viewModel.newTargetTemperature = null;
            }
        }

        //#endregion
    }
}
