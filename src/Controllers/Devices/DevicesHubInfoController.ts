module JustinCredible.SmartHomeMobile.Controllers {

    export interface IDevicesHubInfoController {
        viewModel: ViewModels.DevicesHubInfoViewModel;
    }

    export class DevicesHubInfoController extends BaseController<ViewModels.DevicesHubInfoViewModel> implements IDevicesHubInfoController {

        public static $inject = ["$scope", "HubDataSource", "Utilities", "Preferences"];

        private HubDataSource: Services.HubDataSource;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;

        constructor($scope: ng.IScope, HubDataSource: Services.HubDataSource, Utilities: Services.Utilities, Preferences: Services.Preferences) {
            super($scope, ViewModels.DevicesHubInfoViewModel);

            this.HubDataSource = HubDataSource;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

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
            this.viewModel.hub = homeStatus.hub;
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

        protected getFormattedDate(timestamp: number): string {

            if (!timestamp) {
                return "N/A";
            }

            return moment.unix(timestamp).format("MMM Do YYYY, h:mm a");
        }

        protected getFormattedUpTime(upTimeTotalSeconds: number): string {
            var days: number;

            if (!upTimeTotalSeconds) {
                return "N/A";
            }

            days = upTimeTotalSeconds / 60 / 60 / 24;

            return days.toFixed(1) + " days";
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
