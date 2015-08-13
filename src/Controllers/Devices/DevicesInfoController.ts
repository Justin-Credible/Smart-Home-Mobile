module JustinCredible.SmartHomeMobile.Controllers {

    export interface IDevicesInfoControllerStateParams {
        deviceId: string;
    }

    export class DevicesInfoController extends BaseController<ViewModels.DevicesInfoViewModel> {

        //#region Injection

        public static ID = "DevicesInfoController";

        public static get $inject(): string[] {
            return [
                "$scope",
                "$stateParams",
                Services.HubDataSource.ID,
                Services.Utilities.ID,
                Services.Preferences.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private $stateParams: IDevicesInfoControllerStateParams,
            private HubDataSource: Services.HubDataSource,
            private Utilities: Services.Utilities,
            private Preferences: Services.Preferences) {
            super($scope, ViewModels.DevicesInfoViewModel);
        }

        //#endregion

        //#region BaseController Overrides

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            if (this.HubDataSource.homeStatus == null
                || this.HubDataSource.homeStatusLastUpdated == null
                || this.HubDataSource.homeStatusLastUpdated.diff(moment(), "minutes") > 10) {
                this.refresh();
            }
            else {
                this.populateViewModel(this.HubDataSource.homeStatus, this.HubDataSource.homeStatusLastUpdated);
            }
        }

        //#endregion

        //#region Private Methods

        private populateViewModel(homeStatus: AlertMeApiTypes.HomeStatusGetResult, homeStatusLastUpdated: moment.Moment): void {
            this.viewModel.lastUpdated = homeStatusLastUpdated.toDate();
            this.viewModel.device = _.find(homeStatus.devices, { "id": this.$stateParams.deviceId });
        }

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshHomeStatus().then((result: AlertMeApiTypes.HomeStatusGetResult) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);

                this.populateViewModel(result, this.HubDataSource.homeStatusLastUpdated);

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);
            });
        }

        //#endregion

        //#region Controller Helpers

        protected getVersionDisplayText(versionString: string): string {
            return versionString === "VERSION_UNAVAILABLE" ? "(Version Unavailable)" : versionString;
        }

        protected getBatteryIconClassName(batteryPercentage: number): string {
            var classNames = "";

            if (!batteryPercentage) {
                return "";
            }

            if (batteryPercentage >= 75) {
                classNames = "ion-battery-full";
            }
            else if (batteryPercentage >= 50 && batteryPercentage < 75) {
                classNames = "ion-battery-half";
            }
            else if (batteryPercentage >= 25 && batteryPercentage < 50) {
                classNames = "ion-battery-low";
            }
            else if (batteryPercentage < 25) {
                classNames = "ion-battery-empty";
            }

            // If it has less than 10 percent battery life remaining, then make it red.
            if (batteryPercentage <= 15) {
                classNames += " assertive";
            }

            return classNames;
        }

        protected getProtocolDisplayList(protocols: string[]): string {
            return protocols == null ? "" : protocols.join(", ");
        }

        protected getMissingProtocolDisplayList(missingProtocols: { [id: string]: string }): string {
            return missingProtocols == null ? "" : _.values(missingProtocols).join(", ");
        }

        //#endregion

        //#region Controller Events

        protected refresh_click(): void {
            this.refresh();
        }

        protected refresher_refresh(): void {
            this.refresh();
        }

        //#endregion
    }
}
