module JustinCredible.SmartHomeMobile.Controllers {

    export interface IDevicesInfoController {
        viewModel: ViewModels.DevicesInfoViewModel;
    }

    export class DevicesInfoController extends BaseController<ViewModels.DevicesInfoViewModel> implements IDevicesInfoController {

        public static $inject = ["$scope", "Utilities", "Preferences"];

        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, Preferences: Services.Preferences) {
            super($scope, ViewModels.DevicesInfoViewModel);

            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        public initialize(): void {
        }

        //#endregion
    }
}