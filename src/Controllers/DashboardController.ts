module JustinCredible.SmartHomeMobile.Controllers {

    export class DashboardController extends BaseController<ViewModels.DashboardViewModel> {

        //#region Injection

        public static ID = "DashboardController";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.DashboardHelper.ID,
                Services.HubDataSource.ID,
                Services.Preferences.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            protected DashboardHelper: Services.DashboardHelper,
            private HubDataSource: Services.HubDataSource,
            private Preferences: Services.Preferences) {
            super($scope, ViewModels.DashboardViewModel);
        }

        //#endregion

        //#region Controller Events

        protected view_beforeEnter(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_beforeEnter(event, eventArgs);

            this.viewModel.floorplanImageUrl = this.Preferences.dashboardFloorplanImageUrl;
            this.viewModel.items = this.Preferences.dashboardItems;

            if (this.HubDataSource.dashboardDevices == null
                || this.HubDataSource.dashboardDevicesLastUpdated == null
                || moment().diff(this.HubDataSource.dashboardDevicesLastUpdated, "minutes") > 10) {
                this.refresh();
            }
            else {
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(this.HubDataSource.dashboardDevices);
            }
        }

        //#endregion

        //#region Private Methods

        private refresh(): void {
            this.viewModel.isRefreshing = true;

            this.HubDataSource.refreshDashboardDevices().then((result: Models.DashboardDevices) => {
                this.viewModel.isRefreshing = false;
                this.viewModel.devices = this.DashboardHelper.getDeviceDictionary(result);
                this.viewModel.lastUpdated = this.HubDataSource.dashboardDevicesLastUpdated.toDate();
            }, () => {
                this.viewModel.isRefreshing = false;
            });
        }

        //#endregion

        //#region Attribute/Expression Properties and Helpers

        public getIconForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getIconForItem(item, device);
        }

        public getColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getColorForItem(item, device);
        }

        public getBorderColorForItem(item: Models.DashboardItem): string {
            let device = this.viewModel.devices ? this.viewModel.devices[item.deviceId] : null;
            return this.DashboardHelper.getBorderColorForItem(item, device);
        }

        //#endregion

        //#region Events

        protected refresh_click(): void {
            this.refresh();
        }

        protected item_click(item: Models.DashboardItem): void {
            //TODO
        }

        //#endregion
    }
}
