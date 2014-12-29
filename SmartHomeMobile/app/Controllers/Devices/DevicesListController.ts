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

        public initialize() {

            if (this.HubDataSource.homeStatus == null
                || this.HubDataSource.homeStatusLastUpdated == null
                || this.HubDataSource.homeStatusLastUpdated.diff(moment(), "minutes") > 10) {
                this.refresh();
            }
            else {
                this.populateViewModel(this.HubDataSource.homeStatus, this.HubDataSource.homeStatusLastUpdated);
            }
        }

        public GetBatteryIconClassName(device: AlertMeApiTypes.HomeStatusDevice): string {
            var classNames = "";

            if (!device.hasBattery) {
                classNames = "ion-outlet";
            }
            else if (device.batteryPercentage >= 75) {
                classNames = "ion-battery-full";
            }
            else if (device.batteryPercentage >= 50 && device.batteryPercentage < 75) {
                classNames = "ion-battery-half";
            }
            else if (device.batteryPercentage >= 25 && device.batteryPercentage < 50) {
                classNames = "ion-battery-low";
            }
            else if (device.batteryPercentage < 25) {
                classNames = "ion-battery-empty";
            }

            // If it has less than 10 percent battery life remaining, then make it red.
            if (device.hasBattery && device.batteryPercentage <= 10) {
                classNames += " assertive";
            }

            return classNames;
        }

        public GetDeviceTypeIcon(deviceType: string): string {

            if (!deviceType) {
                return "ion-help";
            }

            switch (deviceType) {
                case "ContactSensor":
                    return "ion-checkmark-circled";
                    //return "ion-android-checkmark-circle";
                case "Camera":
                    return "ion-ios7-videocam";
                case "EverspringSE812":
                    return "ion-ios7-bell";
                case "EverspringST812":
                    return "ion-waterdrop";
                case "FirstAlertSmokeCOAlarm":
                    return "ion-flame";
                case "JascoBinarySwitch":
                    return "ion-toggle-filled";
                case "Keypad":
                    return "ion-android-keypad";
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

        //#region Private Methods

        private populateViewModel(homeStatus: AlertMeApiTypes.HomeStatusGetResult, homeStatusLastUpdated: Moment): void {

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