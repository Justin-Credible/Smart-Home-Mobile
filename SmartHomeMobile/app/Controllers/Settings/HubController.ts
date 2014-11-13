module JustinCredible.SmartHomeMobile.Controllers {

    export interface IHubController {
        viewModel: ViewModels.HubViewModel;
    }

    export class HubController extends BaseController<ViewModels.HubViewModel> implements IHubController {

        public static $inject = ["$scope", "$location", "Utilities", "Preferences", "UiHelper"];

        private $location: ng.ILocationService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, $location: ng.ILocationService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.HubViewModel);

            this.$location = $location;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        public initialize(): void {
            this.viewModel.showSaveButton = false;
            this.viewModel.apiUrl = this.Preferences.irisUrl;
            this.viewModel.userName = this.Preferences.irisUserName;
            this.viewModel.password = this.Preferences.irisPassword;
        }

        //#endregion

        //#region Controller Methods

        public apiInfo_click(): void {
            var infoMessage = "Currently supported hubs are ones that use the AlertMe API (such as Lowe's Iris Smart Home platform). This should be a URL to the root of the AlertMe API such as: https://api.alertme.com/v5";
            var promptMessage = "Would you like to use the default URL for Lowe's Iris Smart Home platform? (https://www.irissmarthome.com/v5)";

            this.UiHelper.alert(infoMessage, "API URL Info").then(() => {
                this.UiHelper.confirm(promptMessage, "API URL Info").then((result: string) => {
                    if (result === "Yes") {
                        this.viewModel.apiUrl = "https://www.irissmarthome.com/v5";
                        this.viewModel.showSaveButton = true;
                    }
                });
            });
        }

        public save_click(): void {

            if (!this.viewModel.apiUrl || !this.viewModel.userName || !this.viewModel.password) {
                this.UiHelper.alert("Please ensure all fields are populated.");
                return;
            }

            // If the password has changed, ensure that the new passwords match.
            if (this.viewModel.showConfirmPassword) {
                if (this.viewModel.password !== this.viewModel.confirmPassword) {
                    this.UiHelper.alert("The passwords do not match, please try again.");
                    this.viewModel.password = "";
                    this.viewModel.confirmPassword = "";
                    return;
                }
            }

            this.Preferences.irisUrl = this.viewModel.apiUrl;
            this.Preferences.irisUserName = this.viewModel.userName;
            this.Preferences.irisPassword = this.viewModel.password;

            this.UiHelper.toast.showShortBottom("Changes have been saved.");
            this.$location.path("/app/settings");//TODO this needs to replace the curent path, or go back in the nav stack
        }

        //#endregion
    }
}