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

        public static FORCE_ARM_OPEN_CONTACT_SENSOR_PROMPT = "A contact sensor appears to be open; are you sure you want to arm the alarm? If you continue, any open sensors will be ignored.";
        public static FORCE_ARM_PROMPT = "A contact sensor appears to be open or a lock is unlocked; are you sure you want to arm the alarm? If you continue, any open sensors or unlocked locks will be ignored.";

        constructor($scope: ng.IScope, Utilities: Services.Utilities, UiHelper: Services.UiHelper, HubDataSource: Services.HubDataSource, AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.SecurityViewModel);

            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.HubDataSource = HubDataSource;
            this.AlertMeApi = AlertMeApi;
        }

        //#region Controller Events

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

            if (this.HubDataSource.security == null
                || this.HubDataSource.securityLastUpdated == null
                || this.HubDataSource.securityLastUpdated.diff(moment(), "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.alarmData = this.HubDataSource.alarm;
                this.viewModel.alarmOverviewData = this.HubDataSource.alarmOverview;
                this.viewModel.lockData = this.HubDataSource.locks;
                this.viewModel.armingGracePeriodRemaining = 0;
                this.viewModel.forceArm = false;
                this.viewModel.isRefreshing = false;
                this.viewModel.lastUpdated = this.HubDataSource.securityLastUpdated.toDate();
            }
        }

        protected view_beforeLeave(): void {
            super.view_beforeLeave();

            clearInterval(this.viewModel.gracePeriodIntervalRef);
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            clearInterval(this.viewModel.gracePeriodIntervalRef);
            this.viewModel.armingGracePeriodRemaining = 0;

            this.HubDataSource.refreshSecurity().then((result: ViewModels.SecurityViewModel) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");

                this.viewModel.alarmData = result.alarmData;
                this.viewModel.alarmOverviewData = result.alarmOverviewData;
                this.viewModel.lockData = result.lockData;
                this.viewModel.forceArm = false;
                this.viewModel.lastUpdated = this.HubDataSource.securityLastUpdated.toDate();

                // If the alarm is in one of these states, it generally is in a countdown before
                // the alarm will actually be armed. In this case we'll guess the countdown as
                // 15 seconds, and start counting down.
                if (this.viewModel.alarmData.state === "ARM_GRACE"
                    || this.viewModel.alarmData.state === "CONTACT_SENSOR_OPEN") {
                    this.viewModel.armingGracePeriodRemaining = 15;
                    this.viewModel.gracePeriodIntervalRef = setInterval(_.bind(this.graceCountdownIntervalCallback, this), 1000);
                }
                else {
                    this.viewModel.armingGracePeriodRemaining = 0;
                }

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");
            });
        }

        private armAlarm(): void {
            var contactSensorIsOpen = false,
                lockIsUnlocked = false;

            // If we aren't forcing the alarm to be armed then we need to check to see if any contact sensors
            // are open or if any locks and not locked.
            if (!this.viewModel.forceArm) {

                contactSensorIsOpen = _.where(this.viewModel.alarmOverviewData.otherDevices, { type: "ContactSensor", state: "OPENED" }).length > 0;
                lockIsUnlocked = this.viewModel.lockData.atAGlance.unlocked > 0;

                if (contactSensorIsOpen || lockIsUnlocked) {
                    //TODO If any contact sensor is open, then prompt the user.
                    this.UiHelper.confirm(SecurityController.FORCE_ARM_PROMPT).then((result: string) => {

                        // The user indicated that they want to continue anyways.
                        if (result === "Yes") {
                            this.viewModel.forceArm = true;
                            this.armAlarm();
                        }
                    });

                    return;
                }
            }

            // Reset the flag so we aren't using the force behavior next time.
            this.viewModel.forceArm = false;

            // Make the call to arm the alarm. We pass now as false and checkState as true so that if a contact
            // sensor is open, the alarm will not be armed. Instead the failure callback will be executed where-in
            // we can notify them and prompt if they want to continue anyways.
            this.AlertMeApi.setAlarmMode(Services.AlertMeApi.AlarmMode.Away, false, true).then((result: AlertMeApiTypes.AlarmModePutResult) => {
                this.viewModel.alarmData.state = result.state;
                this.viewModel.armingGracePeriodRemaining = result.grace;

                // If there was a grace period timeout in the result, then start the countdown in the UI.
                if (result.grace) {
                    this.viewModel.gracePeriodIntervalRef = setInterval(_.bind(this.graceCountdownIntervalCallback, this), 1000);
                }
            }, (error: any) => {
                // If the alarm couldn't be armed because a contact sensor was open, prompt the user to continue.
                // NOTE: [10-27-14] Currently this probably won't ever execute as the AlertMe v5 API implementation
                // doesn't seem to be respecting the state of the now and checkState flags. This is why the same
                // check is done above.
                if (error && error.reason && error.reason === "CONTACT_SENSOR_OPEN") {
                    // A contact sensor etc was open; let the user know.
                    this.UiHelper.confirm(SecurityController.FORCE_ARM_OPEN_CONTACT_SENSOR_PROMPT).then((result: string) => {

                        // The user indicated that they want to continue anyways.
                        if (result === "Yes") {
                            this.viewModel.forceArm = true;
                            this.armAlarm();
                        }
                    });
                }
                else {
                    this.UiHelper.alert("The alarm couldn't be armed due to an unknown error. Please try again.\n\n" + error.reason);
                }
            });
        }

        private graceCountdownIntervalCallback(): void {
            this.viewModel.armingGracePeriodRemaining -= 1;

            // After the countdown has completed, reset the interval and refresh the data.
            if (this.viewModel.armingGracePeriodRemaining === 0) {
                clearInterval(this.viewModel.gracePeriodIntervalRef);
                this.refresh();
            }

            this.scope.$apply();
        }

        //#endregion

        //#region Attribute/Expression Properties

        get armButton_disabled(): boolean {

            // If there is no view model data or it is refreshing, then the button should be disabled.
            if (this.viewModel == null || this.viewModel.alarmData == null || this.viewModel.isRefreshing) {
                return true;
            }

            return this.viewModel.alarmData.state === "ARMED"
                || this.viewModel.alarmData.state === "arming"
                || this.viewModel.alarmData.state === "CONTACT_SENSOR_OPEN"
                || this.viewModel.alarmData.state === "ARM_GRACE";
        }

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
            this.armAlarm();
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
