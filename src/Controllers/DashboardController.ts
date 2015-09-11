module JustinCredible.SmartHomeMobile.Controllers {

    export class DashboardController extends BaseController<ViewModels.DashboardViewModel> {

        //#region Injection

        public static ID = "DashboardController";

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
            super($scope, ViewModels.DashboardViewModel);
        }

        //#endregion

        //#region Controller Events

        //#endregion

        //#region Private Methods

        //#endregion

        //#region Attribute/Expression Properties

        //#endregion

        //#region Events

        //#endregion
    }
}
