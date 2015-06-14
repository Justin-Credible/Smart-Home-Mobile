module JustinCredible.SmartHomeMobile.Controllers {

    export interface IDevicesListController {
        viewModel: ViewModels.DevicesListViewModel;
    }

    export class DevicesListController extends BaseController<ViewModels.DevicesListViewModel> implements IDevicesListController {

        public static $inject = ["$scope", "Utilities", "UiHelper", "HubDataSource", "AlertMeApi"];

        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private HubDataSource: Services.HubDataSource;
        private AlertMeApi: Services.AlertMeApi;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, UiHelper: Services.UiHelper, HubDataSource: Services.HubDataSource, AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.DevicesListViewModel);

            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.HubDataSource = HubDataSource;
            this.AlertMeApi = AlertMeApi;
        }

        //#region Controller Events

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

            this.viewModel.homeStatus = homeStatus;
            this.viewModel.lastUpdated = homeStatusLastUpdated.toDate();
            this.viewModel.deviceCount = _.toArray(homeStatus.devices).length;
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

        public GetDeviceTypeIcon(deviceType: string): string {

            if (!deviceType) {
                return "ion-help";
            }

            switch (deviceType) {
                case "ContactSensor":
                    return "ion-checkmark-circled";
                case "Camera":
                    return "ion-ios-videocam";
                case "EverspringSE812":
                    return "ion-ios-bell";
                case "EverspringST812":
                    return "ion-waterdrop";
                case "FirstAlertSmokeCOAlarm":
                    return "ion-flame";
                case "JascoBinarySwitch":
                    return "ion-toggle-filled";
                case "Keypad":
                    return "ion-ios-keypad";
                case "KwiksetDeadbolt":
                    return "ion-locked";
                case "Repeater":
                    return "ion-wifi";
                case "RtcoaCT101":
                    return "ion-thermometer";
                default:
                    return "ion-cube";
            }
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
