module JustinCredible.SmartHomeMobile.Controllers {

    export interface ICamerasController {
        viewModel: ViewModels.CamerasViewModel;
    }

    export class CamerasController extends BaseController<ViewModels.CamerasViewModel> implements ICamerasController {

        public static $inject = ["$scope", "$location", "Utilities", "Preferences", "UiHelper"];

        private $location: ng.ILocationService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;
        private versionInfo: Interfaces.VersionInfo;

        constructor($scope: ng.IScope, $location: ng.ILocationService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.CamerasViewModel);

            this.$location = $location;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        public view_enter(): void {
            this.viewModel.cameras = this.Preferences.cameras;

            if (!this.viewModel.cameras) {
                this.viewModel.cameras = [];
            }
        }

        //#endregion

        //#region Attribute/Expression Properties

        get snapshots_show(): boolean {
            var snapshotCameras: Models.Camera[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.cameras == null) {
                return false;
            }

            // We want to show the snapshots section if we have snapshot cameras.
            snapshotCameras = _.filter(this.viewModel.cameras, (camera: Models.Camera) => {
                return camera.type === "SNAPSHOT";
            });

            // We need at least one to show this section.
            return snapshotCameras.length > 0;
        }

        get streaming_show(): boolean {
            var streamingCameras: Models.Camera[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.cameras == null) {
                return false;
            }

            // We want to show the streaming section if we have streaming cameras.
            streamingCameras = _.filter(this.viewModel.cameras, (camera: Models.Camera) => {
                return camera.type === "STREAMING";
            });

            // We need at least one to show this section.
            return streamingCameras.length > 0;
        }

        //#endregion

        //#region Controller Methods

        //#endregion
    }
}