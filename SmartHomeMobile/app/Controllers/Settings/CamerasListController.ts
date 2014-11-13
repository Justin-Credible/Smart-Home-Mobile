module JustinCredible.SmartHomeMobile.Controllers {

    export interface ICamerasListController {
        viewModel: ViewModels.CamerasListViewModel;
    }

    export class CamerasListController extends BaseController<ViewModels.CamerasListViewModel> implements ICamerasListController {

        public static $inject = ["$scope", "$location", "Utilities", "Preferences", "UiHelper"];

        private $location: ng.ILocationService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;
        private versionInfo: JustinCredible.SmartHomeMobile.DataTypes.IVersionInfo;

        constructor($scope: ng.IScope, $location: ng.ILocationService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.CamerasListViewModel);

            this.$location = $location;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        public initialize(): void {
            this.viewModel.cameras = this.Preferences.cameras;

            if (!this.viewModel.cameras) {
                this.viewModel.cameras = [];
            }
        }

        //#endregion

        //#region Controller Methods

        public add_click(): void {
            //TODO
        }

        //#endregion
    }
}