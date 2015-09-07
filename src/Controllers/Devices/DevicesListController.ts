module JustinCredible.SmartHomeMobile.Controllers {

    export class DevicesListController extends BaseController<ViewModels.DevicesListViewModel> {

        //#region Injection

        public static ID = "DevicesListController";

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
            private $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private HubDataSource: Services.HubDataSource,
            private AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.DevicesListViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            if (this.HubDataSource.homeStatus == null
                || this.HubDataSource.homeStatusLastUpdated == null
                || moment().diff(this.HubDataSource.homeStatusLastUpdated, "minutes") > 10) {
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
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);

                this.populateViewModel(result, this.HubDataSource.homeStatusLastUpdated);

            }, () => {
                this.viewModel.isRefreshing = false;
                this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);
            });
        }

        //#endregion

        //#region Controller Helpers

        protected GetDeviceTypeIcon(deviceType: string): string {

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
