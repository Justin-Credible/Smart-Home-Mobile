module JustinCredible.SmartHomeMobile.Controllers {

    export interface ICameraViewControllerStateParams {
        id: string;
    }

    export class CameraViewController extends BaseController<ViewModels.CameraViewViewModel> {

        //#region Injection

        public static ID = "CameraViewController";

        public static get $inject(): string[] {
            return [
                "$scope",
                "$stateParams",
                "$location",
                "$sce",
                "$ionicHistory",
                Services.Utilities.ID,
                Services.Preferences.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private $stateParams: ICameraViewControllerStateParams,
            private $location: ng.ILocationService,
            private $sce: ng.ISCEService,
            private $ionicHistory: any,
            private Utilities: Services.Utilities,
            private Preferences: Services.Preferences) {
            super($scope, ViewModels.CameraViewViewModel);
        }

        //#endregion

        private _pollingTimeout: number;

        //#region BaseController Overrides

        protected initialize(): void {
            this.scope.$on("device.pause", _.bind(this.device_pause, this));
        }

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

            // Grab the camera from the preferences by ID.
            this.viewModel.camera = _.where(this.Preferences.cameras, { id: this.$stateParams.id })[0];

            // Only show the loading panel if this is a snapshot camera (while the image is loading).
            // Streaming cameras should start populating immediately.
            this.viewModel.showLoadingPanel = this.viewModel.camera.type === "SNAPSHOT";

            // Push the camera URL into the image tag.
            this.refresh();
        }

        protected view_leave(): void {
            super.view_leave();

            this.stopStreaming();
        }

        //#endregion

        //#region Events

        public device_pause(): void {
            this.stopStreaming();
        }

        //#endregion

        //#region Private Methods

        private buildUrl(camera: Models.Camera, includeCredentials: boolean): string {
            var url: string,
                uri: uri.URIOptions;

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

        private stopStreaming(): void {

            // Ensure that the URL is switched back to a local image. This stops the
            // MJPEG stream from continuing to stream in the background.
            this.viewModel.url = "images/place-holder.png";

            // Ensure that the setTimeout is cleared. This stops the updating of the
            // snapshot images.
            clearTimeout(this._pollingTimeout);
        }

        private refresh(): void {
            // Delegate to the buildUrl method to build the URL for the image tag.
            this.viewModel.url = this.buildUrl(this.viewModel.camera, false);
        }

        //#endregion

        //#region Controller Methods

        protected refresh_click(): void {

            // Ensure that we aren't already streaming.
            this.stopStreaming();

            // Refresh the image with a new URL.
            this.refresh();
        }

        protected refresher_refresh(): void {

            // Ensure that we aren't already streaming.
            this.stopStreaming();

            // Refresh the image with a new URL.
            this.refresh();
        }

        protected image_load(): void {

            // Now that the image has loaded, update the timestamp.
            this.viewModel.lastUpdated = moment().toDate();

            // If this is a snapshot camera, then we need to queue up a function call
            // to load the next image one second from now.
            if (this.viewModel.camera.type === "SNAPSHOT") {
                this._pollingTimeout = setTimeout(() => {
                    this.viewModel.showLoadingPanel = false;
                    this.refresh();
                    this.scope.$apply();
                    this.scope.$broadcast(Constants.Events.SCROLL_REFRESH_COMPLETE);
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
        protected getIframeUrl(camera: Models.Camera): string {

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
