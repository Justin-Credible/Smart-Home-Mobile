module JustinCredible.SmartHomeMobile.Controllers {

    export interface IMenuController {
        viewModel: ViewModels.MenuViewModel;
    }

    export class MenuController extends BaseController<ViewModels.MenuViewModel> implements IMenuController {

        public static $inject = ["$scope", "$location", "$http", "Utilities", "UiHelper", "Preferences", "IrisApi"];

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private IrisApi: Services.IrisApi;

        private isReloginPromptVisible = false;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, IrisApi: Services.IrisApi) {
            super($scope, ViewModels.MenuViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.IrisApi = IrisApi;

            this.viewModel.categories = this.Utilities.categories;

            $scope.$on("http.error", _.bind(this.http_error, this));
            $scope.$on("http.unauthorized", _.bind(this.http_unauthorized, this));
            $scope.$on(Services.IrisApi.URL_NOT_SPECIFIED_EVENT, _.bind(this.irisApi_urlNotSpecified, this));
            $scope.$on(Services.IrisApi.CREDENTIALS_NOT_SPECIFIED_EVENT, _.bind(this.irisApi_credentialsNotSpecified, this));
        }

        //#region Event Handlers

        private http_error(event: ng.IAngularEvent, error: ng.IHttpPromiseCallbackArg<any>): void {

            if (error.data && error.data.error && typeof (error.data.error.reason) === "string") {
                // In some cases, the API will return an error object with a reason enumeration/code.
                // These usually a pretty human readable, especially after the underscores are stripped
                // and the string is converted to title case.
                this.UiHelper.toast.showLongBottom(this.Utilities.toTitleCase(error.data.error.reason));
            }
            else {
                this.UiHelper.toast.showLongBottom(this.Utilities.format("HTTP {0} - {1}", error.status, error.statusText));
            }
        }

        private http_unauthorized(event: ng.IAngularEvent, error: ng.IHttpPromiseCallbackArg<any>): void {

            if (/*error.config["IS_IRIS"] && */ !this.isReloginPromptVisible) {

                this.isReloginPromptVisible = true;

                this.UiHelper.confirm("Your Iris session is invalid; would you like to attempt to re-login?").then((result: string) => {

                    if (result === "No") {
                        this.isReloginPromptVisible = false;
                        return;
                    }

                    this.UiHelper.progressIndicator.showText(true, "Authenticating...", "center");

                    this.IrisApi.login().then((result: any) => {
                        this.isReloginPromptVisible = false;
                        this.UiHelper.progressIndicator.hide();
                        this.UiHelper.progressIndicator.showSuccess(false, "Login successful");
                        this.UiHelper.toast.showShortBottom("You have been logged in successfully; please try your request again.");
                    }, () => {
                        this.isReloginPromptVisible = false;
                        this.UiHelper.progressIndicator.hide();
                    });
                });
            }
        }

        private irisApi_urlNotSpecified(): void {
            this.UiHelper.toast.showLongBottom("Iris API URL is required; see preferences.");
        }

        private irisApi_credentialsNotSpecified(): void {
            this.UiHelper.toast.showLongBottom("Iris API credentials are required; see preferences.");
        }

        //#endregion

        //#region Controller Methods

        public reorder_click() {
            this.UiHelper.showDialog(this.UiHelper.DialogIds.ReorderCategories).then(() => {
                // After the re-order dialog is closed, re-populate the category
                // items since they may have been re-ordered.
                this.viewModel.categories = this.Utilities.categories;
            });
        }

        //#endregion
    }
}