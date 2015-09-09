module JustinCredible.SmartHomeMobile.Controllers {

    export class RootController extends BaseController<ViewModels.RootViewModel> {

        //#region Injection

        public static ID = "RootController";

        public static get $inject(): string[] {
            return [
                "$scope",
                "$location",
                "$http",
                "$ionicPopover",
                Services.Utilities.ID,
                Services.UiHelper.ID,
                Services.Preferences.ID,
                Services.AlertMeApi.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private $location: ng.ILocationService,
            private $http: ng.IHttpService,
            private $ionicPopover: any,
            private Utilities: Services.Utilities,
            private UiHelper: Services.UiHelper,
            private Preferences: Services.Preferences,
            private AlertMeApi: Services.AlertMeApi) {
            super($scope, ViewModels.RootViewModel);
        }

        //#endregion

        private _hasLoaded = false;

        protected popover: any;

        //#region BaseController Overrides

        protected view_loaded(event?: ng.IAngularEvent, eventArgs?: Ionic.IViewEventArguments): void {
            super.view_loaded(event, eventArgs);

            // In most cases Ionic's load event only fires once, the first time the controller is
            // initialize and attached to the DOM. However, abstract controllers (eg this one) will
            // have their Ionic view events fired for child views as well. Here we ensure that we
            // don't run the code below if we've already loaded before and a child is loading.
            if (this._hasLoaded) {
                return;
            }

            this._hasLoaded = true;

            this.viewModel.isDebugMode = this.Utilities.isDebugMode;
            this.viewModel.categories = this.Preferences.categories;

            this.$ionicPopover.fromTemplateUrl("templates/More-Menu.html", {
                scope: this.scope
            }).then((popover: any) => {
                this.popover = popover;
            });

            this.scope.$on(Constants.Events.HTTP_ERROR, _.bind(this.http_error, this));
            this.scope.$on(Services.AlertMeApi.URL_NOT_SPECIFIED_EVENT, _.bind(this.alertMeApi_urlNotSpecified, this));
            this.scope.$on(Services.AlertMeApi.CREDENTIALS_NOT_SPECIFIED_EVENT, _.bind(this.alertMeApi_credentialsNotSpecified, this));
        }

        //#endregion

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

        protected debuggerBreak_click(): void {
            this.popover.hide();

            debugger;
        }

        //#endregion
    }
}
