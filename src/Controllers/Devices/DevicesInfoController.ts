module JustinCredible.SmartHomeMobile.Controllers {

    export interface IDevicesInfoControllerStateParams {
        deviceId: string;
    }

    export interface IDevicesInfoController {
        viewModel: ViewModels.DevicesInfoViewModel;
    }

    export class DevicesInfoController extends BaseController<ViewModels.DevicesInfoViewModel> implements IDevicesInfoController {

        public static $inject = ["$scope", "$stateParams", "HubDataSource", "Utilities", "Preferences"];

        private stateParams: IDevicesInfoControllerStateParams;
        private HubDataSource: Services.HubDataSource;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;

        constructor($scope: ng.IScope, $stateParams: IDevicesInfoControllerStateParams, HubDataSource: Services.HubDataSource, Utilities: Services.Utilities, Preferences: Services.Preferences) {
            super($scope, ViewModels.DevicesInfoViewModel);

            this.stateParams = $stateParams;
            this.HubDataSource = HubDataSource;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        public view_beforeEnter(): void {

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
            this.viewModel.device = _.find(homeStatus.devices, { "id": this.stateParams.deviceId });
        }

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshHomeStatus().then((result: AlertMeApiTypes.HomeStatusGetResult) => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");

                this.populateViewModel(result, this.HubDataSource.homeStatusLastUpdated);

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast("scroll.refreshComplete");
            });
        }

        //#endregion

        //#region Controller Helpers

        public getVersionDisplayText(versionString: string): string {
            return versionString === "VERSION_UNAVAILABLE" ? "(Version Unavailable)" : versionString;
        }

        public getBatteryIconClassName(batteryPercentage: number): string {
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

        public getProtocolDisplayList(protocols: string[]): string {
            return protocols == null ? "" : protocols.join(", ");
        }

        public getMissingProtocolDisplayList(missingProtocols: { [id: string]: string }): string {
            return missingProtocols == null ? "" : _.values(missingProtocols).join(", ");
        }

        //#endregion

        //#region Events

        public refresh_click(): void {
            this.refresh();
        }

        public refresher_refresh(): void {
            this.refresh();
        }

        //#endregion
    }
}
