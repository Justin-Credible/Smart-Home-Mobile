module JustinCredible.SmartHomeMobile.Controllers {

    export interface ICameraViewControllerStateParams {
        id: string;
    }

    export interface ICameraViewController {
        viewModel: ViewModels.CameraViewViewModel;
    }

    export class CameraViewController extends BaseController<ViewModels.CameraViewViewModel> implements ICameraViewController {

        public static $inject = ["$scope", "$stateParams", "$location", "$sce", "$ionicViewService", "Utilities", "Preferences"];

        private stateParams: ICameraViewControllerStateParams;
        private $location: ng.ILocationService;
        private $sce: ng.ISCEService;
        private $ionicViewService: any;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;

        private pollingTimeout: number;

        constructor($scope: ng.IScope, $stateParams: ICameraViewControllerStateParams, $location: ng.ILocationService, $sce: ng.ISCEService, $ionicViewService: any, Utilities: Services.Utilities, Preferences: Services.Preferences) {
            super($scope, ViewModels.CameraViewViewModel);

            this.stateParams = $stateParams;
            this.$sce = $sce;
            this.$location = $location;
            this.$ionicViewService = $ionicViewService;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        public view_enter(): void {
            // Grab the camera from the preferences by ID.
            this.viewModel.camera = _.where(this.Preferences.cameras, { id: this.stateParams.id })[0];

            // Only show the loading panel if this is a snapshot camera (while the image is loading).
            // Streaming cameras should start populating immediately.
            this.viewModel.showLoadingPanel = this.viewModel.camera.type === "SNAPSHOT";

            // Push the camera URL into the image tag.
            this.refresh();
        }

        public view_leave(): void {
            clearTimeout(this.pollingTimeout);
        }

        //#endregion

        //#region Private Methods

        private buildUrl(camera: Models.Camera, includeCredentials: boolean): string {
            var url: string,
                uri: URIOptions;

            if (!camera) {
                return "";
            }

            if (includeCredentials && (camera.userName || camera.password)) {
                // If using credentials, then we need to add them into the URL.

                // Parse the URL into a URI structure.
                uri = URI.parse(camera.url);

                // Add the user name and password.
                uri.username = camera.userName;
                uri.password = camera.password;

                // Morph the URI structure back into a plain-text URL.
                url = (new URI(uri)).valueOf();
            }
            else {
                // If not using credentials then we can just use the URL as is.
                url = camera.url;
            }

            // If this is a snapshot camera, add a query string parameter so we can bypass
            // the browser's local cache and ensure we get a new image.
            if (camera.type === "SNAPSHOT") {
                url += "?random=" + moment().format();
            }

            return url;
        }

        private refresh(): void {
            // Delegate to the buildUrl method to build the URL for the image tag.
            this.viewModel.url = this.buildUrl(this.viewModel.camera, false);
        }

        //#endregion

        //#region Controller Methods

        public refresh_click(): void {

            // Streaming cameras don't support refreshing because they are always streaming.
            if (this.viewModel.camera.type === "STREAMING") {
                return;
            }

            // Ensure that the queued up function to update the snapshot is cancelled since
            // we are going to refresh immediately.
            clearTimeout(this.pollingTimeout);

            // Refresh the image with a new URL.
            this.refresh();
        }

        public refresher_refresh(): void {

            // Streaming cameras don't support refreshing because they are always streaming.
            if (this.viewModel.camera.type === "STREAMING") {
                this.scope.$broadcast("scroll.refreshComplete");
                return;
            }

            // Ensure that the queued up function to update the snapshot is cancelled since
            // we are going to refresh immediately.
            clearTimeout(this.pollingTimeout);

            // Refresh the image with a new URL.
            this.refresh();
        }

        public image_load(): void {

            // Now that the image has loaded, update the timestamp.
            this.viewModel.lastUpdated = moment().toDate();

            // If this is a snapshot camera, then we need to queue up a function call
            // to load the next image one second from now.
            if (this.viewModel.camera.type === "SNAPSHOT") {
                this.pollingTimeout = setTimeout(() => {
                    this.viewModel.showLoadingPanel = false;
                    this.refresh();
                    this.scope.$apply();
                    this.scope.$broadcast("scroll.refreshComplete");
                }, 1000);
            }
        }

        /**
         * Used to return a URL for use in the iframe. This URL will contain the credentials for the camera.
         * This is used to force the browser to use the basic auth credentials that are embedded in the URL
         * since it won't use them via the image element's src attribute. If the given camera doesn't utilize
         * credentials, this will return an empty string.
         * 
         * http://stackoverflow.com/questions/25505110/alternative-to-showing-mjpeg-in-an-img-tag-with-basic-authentication
         */
        public getIframeUrl(camera: Models.Camera): string {

            if (!camera) {
                return "";
            }

            if (camera.userName || camera.password) {
                return this.$sce.trustAsResourceUrl(this.buildUrl(camera, true));
            }
            else {
                return "";
            }
        }

        //#endregion
    }
}