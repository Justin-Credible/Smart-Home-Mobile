module JustinCredible.SmartHomeMobile.Controllers {

    export interface ICameraEditControllerStateParams {
        id: string;
    }

    export class CameraEditController extends BaseController<ViewModels.CameraEditViewModel> {

        public static ID = "CameraEditController";

        public static get $inject(): string[] {
            return ["$scope", "$stateParams", "$location", "$ionicHistory", Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID];
        }

        private stateParams: ICameraEditControllerStateParams;
        private $location: ng.ILocationService;
        private $ionicHistory: any;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, $stateParams: ICameraEditControllerStateParams, $location: ng.ILocationService, $ionicHistory: any, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.CameraEditViewModel);

            this.stateParams = $stateParams;
            this.$location = $location;
            this.$ionicHistory = $ionicHistory;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

            this.viewModel.showSaveButton = false;

            if (this.stateParams.id) {
                // If an ID is present, then we are editing an existing camera.
                this.viewModel.title = "Edit Camera";
                this.viewModel.camera = _.where(this.Preferences.cameras, { id: this.stateParams.id })[0];
                this.viewModel.showConfirmPassword = false;
            }
            else {
                // If an ID is not present, then we are adding a new camera.
                this.viewModel.title = "Add Camera";
                this.viewModel.camera = new Models.Camera();
                this.viewModel.camera.type = "SNAPSHOT";
                this.viewModel.showConfirmPassword = true;
            }
        }

        //#endregion

        //#region Controller Methods

        protected typeInfo_click(): void {
            var infoMessage = "A 'Snapshot/Slideshow' camera exposes a single static image which needs to be refreshed every few seconds using polling. A 'Streaming Video (mjpeg)' camera exposes a MJPEG video feed that can be streamed directly without polling.";

            this.UiHelper.alert(infoMessage, "Stream Type Info");
        }

        protected urlInfo_click(): void {
            var infoMessage = "For snapshot/slideshow cameras, this should be a URL which returns a response of image/* when a GET request is made to it. For motion JPEG cameras, this should be a URL that returns a motion JPEG video stream (image/mjpeg).";

            this.UiHelper.alert(infoMessage, "Image / Video URL Info");
        }

        protected credentialsInfo_click(): void {
            var infoMessage = "For cameras that are secured with HTTP basic authentication, these credentials will be used.";

            this.UiHelper.alert(infoMessage, "Camera Credentials Info");
        }

        protected save_click(): void {
            var cameras: Models.Camera[],
                cameraToUpdate: Models.Camera;

            if (!this.viewModel.camera.type || !this.viewModel.camera.name || !this.viewModel.camera.url) {
                this.UiHelper.alert("Please ensure all fields are populated; name, type, and URL are required.");
                return;
            }

            // If the password has changed, ensure that the new passwords match.
            if (this.viewModel.showConfirmPassword) {
                if (this.viewModel.camera.password !== this.viewModel.confirmPassword) {
                    this.UiHelper.alert("The passwords do not match, please try again.");
                    this.viewModel.camera.password = "";
                    this.viewModel.confirmPassword = "";
                    return;
                }
            }

            // Grab the full camera collection from preferences.
            cameras = this.Preferences.cameras;

            if (cameras == null) {
                cameras = [];
            }

            if (this.viewModel.camera.id) {
                // For an existing camera, find it by ID.
                cameraToUpdate = _.where(cameras, { id: this.viewModel.camera.id })[0];
            }
            else {
                // For a new camera, create an new instance.
                cameraToUpdate = new Models.Camera();
                cameraToUpdate.id = this.Utilities.generateGuid();
                cameras.push(cameraToUpdate);
            }

            // Update the values.
            cameraToUpdate.name = this.viewModel.camera.name;
            cameraToUpdate.userName = this.viewModel.camera.userName;
            cameraToUpdate.password = this.viewModel.camera.password;
            cameraToUpdate.type = this.viewModel.camera.type;
            cameraToUpdate.url = this.viewModel.camera.url;

            // Push the updated camera array back into preferences.
            this.Preferences.cameras = cameras;

            // Kick the user back to the camera list view.
            this.UiHelper.toast.showShortBottom("Changes have been saved.");
            this.$ionicHistory.goBack();
        }

        //#endregion
    }
}
