module JustinCredible.SmartHomeMobile.Controllers {

    export interface ISecurityController {
        viewModel: ViewModels.SecurityViewModel;
    }

    export class SecurityController extends BaseController<ViewModels.SecurityViewModel> implements ISecurityController {

        public static $inject = ["$scope", "Utilities", "UiHelper", "HubDataSource", "AlertMeApi"];

        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private HubDataSource: Services.HubDataSource;
        private AlertMeApi: Services.AlertMeApi;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, UiHelper: Services.UiHelper, HubDataSource: Services.HubDataSource, AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.SecurityViewModel);

            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.HubDataSource = HubDataSource;
            this.AlertMeApi = AlertMeApi;
        }

        //#region Controller Events

        public initialize() {

            if (this.HubDataSource.security == null
                || this.HubDataSource.securityLastUpdated == null
                || this.HubDataSource.securityLastUpdated.diff(moment(), "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.alarmData = this.HubDataSource.alarm;
                this.viewModel.alarmOverviewData = this.HubDataSource.alarmOverview;
                this.viewModel.lockData = this.HubDataSource.locks;
                this.viewModel.isRefreshing = false;
                this.viewModel.lastUpdated = this.HubDataSource.securityLastUpdated.toDate();
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshSecurity().then((result: ViewModels.SecurityViewModel) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");

                this.viewModel.alarmData = result.alarmData;
                this.viewModel.alarmOverviewData = result.alarmOverviewData;
                this.viewModel.lockData = result.lockData;
                this.viewModel.lastUpdated = this.HubDataSource.securityLastUpdated.toDate();
            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");
            });
        }

        //#endregion

        //#region Attribute/Expression Properties

        get lockAllButton_disabled(): boolean {
            var disabled = true;

            // If there is no view model data, then the button should be disabled.
            if (this.viewModel == null
                || this.viewModel.lockData == null
                || this.viewModel.lockData.locks == null
                || this.viewModel.lockData.locks.length === 0) {
                return true;
            }

            // If ANY of the locks are unlocked, then the button should be enabled.
            this.viewModel.lockData.locks.forEach((lock: AlertMeApiTypes.LockDevice) => {
                if (lock.lockState === "UNLOCKED") {
                    disabled = false;
                }
            });

            return disabled;
        }

        get unlockAllButton_disabled(): boolean {
            var disabled = true;

            // If there is no view model data, then the button should be disabled.
            if (this.viewModel == null
                || this.viewModel.lockData == null
                || this.viewModel.lockData.locks == null
                || this.viewModel.lockData.locks.length === 0) {
                return true;
            }

            // If ANY of the locks are locked, then the button should be enabled.
            this.viewModel.lockData.locks.forEach((lock: AlertMeApiTypes.LockDevice) => {
                if (lock.lockState === "LOCKED") {
                    disabled = false;
                }
            });

            return disabled;
        }

        //#endregion

        //#region Events

        public refresh_click(): void {
            this.refresh();
        }

        public refresher_refresh(): void {
            this.refresh();
        }

        public arm_click(): void {


            // Make the call to arm the alarm. We pass now as false and checkState as true so that if a contact
            // sensor is open, the alarm will not be armed. Instead the failure callback will be executed where-in
            // we can notify them and prompt if they want to continue anyways.
            this.AlertMeApi.setAlarmMode(Services.AlertMeApi.AlarmMode.Away, false, true).then((result: AlertMeApiTypes.AlarmModePutResult) => {
                this.viewModel.alarmData.state = "ARMED";
            }/*, (error: any) => {

                // NOTE: [10-27-14] Commenting this out for now as the AlertMe v5 API implementation doesn't seem to be
                // respecting the state of the now and checkState flags.

                if (error && error.reason && error.reason === "CONTACT_SENSOR_OPEN") {
                    // A contact sensor etc was open; let the user know.
                    this.UiHelper.confirm("A contact sensor appears to be open; are you sure you want to arm the alarm?").then((result: string) => {

                        // The user decided to cancel out.
                        if (result === "No") {
                            return;
                        }

                        // The user indicated that they want to continue anyways. Make the call again, but this time pass
                        // now as true and checkState as false so the arming will ignore/bypass the open sensors.
                        this.AlertMeApi.setAlarmMode(Services.AlertMeApi.AlarmMode.Away, true, false).then((result: AlertMeApiTypes.AlarmModePutResult) => {
                            this.viewModel.alarmData.state = "ARMED";
                        });
                    });
                }
            }*/);
        }

        public disarm_click(): void {
            this.AlertMeApi.setAlarmMode(Services.AlertMeApi.AlarmMode.Home, true, false).then((result: AlertMeApiTypes.AlarmModePutResult) => {
                this.viewModel.alarmData.state = "DISARMED";
            });
        }

        public info_click(): void {
            var info: string,
                summary = this.viewModel.alarmOverviewData.summary,
                triggerTime: number,
                clearTime: number;

            // The AlertMe API returns zero if a time isn't available. But if it is
            // available it returns the time as seconds since the unix epox as a string
            // value. Here we normalize the value to ensure we always have a number.

            if (summary.triggerTime) {
                triggerTime = parseInt(summary.triggerTime, 10);
            }

            if (summary.clearTime) {
                clearTime = parseInt(summary.clearTime, 10);
            }

            info = this.Utilities.format("Message: {0}\nAlarm Type: {1}\nTrigger Time: {2}\nClear Time: {3}\nDevice Type: {4}\nDevice Name: {5}",
                this.Utilities.toTitleCase(summary.message),
                this.Utilities.toTitleCase(summary.alarm),
                triggerTime ? moment.unix(triggerTime).format() : "N/A",
                clearTime ? moment.unix(clearTime).format() : "N/A",
                this.Utilities.camelCaseToTitleCase(summary.deviceType),
                summary.deviceName);

            this.UiHelper.alert(info);
        }

        public lockToggle_click(device: AlertMeApiTypes.LockDevice): void {
            var oldLockState: string,
                newLockState: string;

            // Save this off, so the API call fails, we can set the value
            // back to its original value.
            oldLockState = device.lockState;

            // Determine what lock state we need to pass to the API call
            // based on the current lock state (we use the opposite).
            newLockState = device.lockState === "LOCKED" ? Services.AlertMeApi.LockState.Unlocked : Services.AlertMeApi.LockState.Locked;

            this.AlertMeApi.setLockState(device.id, newLockState).then(() => {
                // If the API call succeeded, set the new lock state into
                // the view model.
                device.lockState = newLockState;
            }, () => {
                // If the API call failed, then preserve the previous state.
                device.lockState = oldLockState;
            });
        }

        public lockAll_click(): void {
            var oldLockStates: string[] = [];

            // Save this off, so the API call fails, we can set the value
            // back to its original value.
            this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice) => {
                oldLockStates.push(device.lockState);
            });

            this.AlertMeApi.setLockState("all", "LOCKED").then(() => {
                // If the API call succeeded, set the new lock state into
                // the view model.
                this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice) => {
                    device.lockState = "LOCKED";
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice, index: number) => {
                    device.lockState = oldLockStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        public unlockAll_click(): void {
            var oldLockStates: string[] = [];

            // Save this off, so the API call fails, we can set the value
            // back to its original value.
            this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice) => {
                oldLockStates.push(device.lockState);
            });

            this.AlertMeApi.setLockState("all", "UNLOCKED").then(() => {
                // If the API call succeeded, set the new lock state into
                // the view model.
                this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice) => {
                    device.lockState = "UNLOCKED";
                });
            }, () => {
                // If the API call failed, then preserve the previous state.
                this.viewModel.lockData.locks.forEach((device: AlertMeApiTypes.LockDevice, index: number) => {
                    device.lockState = oldLockStates[index];
                });

                // Then make a refresh call; it is possible only a subset of the devices failed.
                // In this case we want to make sure all the states in the view model are up to date.
                this.refresh();
            });
        }

        //#endregion
    }
}