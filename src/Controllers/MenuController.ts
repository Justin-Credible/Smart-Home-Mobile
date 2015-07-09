module JustinCredible.SmartHomeMobile.Controllers {

    export class MenuController extends BaseController<ViewModels.MenuViewModel> {

        public static ID = "MenuController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.AlertMeApi.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private AlertMeApi: Services.AlertMeApi;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.MenuViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.AlertMeApi = AlertMeApi;

            this.viewModel.categories = this.Preferences.categories;

            $scope.$on("http.error", _.bind(this.http_error, this));
            $scope.$on(Services.AlertMeApi.URL_NOT_SPECIFIED_EVENT, _.bind(this.alertMeApi_urlNotSpecified, this));
            $scope.$on(Services.AlertMeApi.CREDENTIALS_NOT_SPECIFIED_EVENT, _.bind(this.alertMeApi_credentialsNotSpecified, this));
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

        private alertMeApi_urlNotSpecified(): void {
            this.UiHelper.toast.showLongBottom("AlertMe API URL is required; see preferences.");
        }

        private alertMeApi_credentialsNotSpecified(): void {
            this.UiHelper.toast.showLongBottom("AlertMe API credentials are required; see preferences.");
        }

        //#endregion

        //#region Controller Methods

        protected category_click(category: ViewModels.CategoryItemViewModel): void {
            // Update the default category whenever the user changes categories.
            // This ensures that the next time the application is started they'll
            // start out on the category that they were on last.
            this.Preferences.defaultCategoryName = category.name;
        }

        protected reorder_click() {
            this.UiHelper.showDialog(ReorderCategoriesController.ID).then(() => {
                // After the re-order dialog is closed, re-populate the category
                // items since they may have been re-ordered.
                this.viewModel.categories = this.Preferences.categories;
            });
        }

        //#endregion
    }
}
