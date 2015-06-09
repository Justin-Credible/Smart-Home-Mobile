module JustinCredible.SmartHomeMobile.Controllers {

    export interface ISettingsController {
        viewModel: ViewModels.SettingsListViewModel;
    }

    export class SettingsListController extends BaseController<ViewModels.SettingsListViewModel> implements ISettingsController {

        public static $inject = ["$scope", "Utilities", "Preferences"];

        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, Preferences: Services.Preferences) {
            super($scope, ViewModels.SettingsListViewModel);

            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        public view_beforeEnter(): void {
            this.viewModel.isDebugMode = this.Utilities.isDebugMode;
            this.viewModel.isDeveloperMode = this.Preferences.enableDeveloperTools;
            this.viewModel.showPin = !this.Utilities.isChromeExtension;
            this.viewModel.showPassphrase = this.Utilities.isChromeExtension;
        }

        //#endregion
    }
}
