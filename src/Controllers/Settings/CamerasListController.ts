module JustinCredible.SmartHomeMobile.Controllers {

    export class CamerasListController extends BaseController<ViewModels.CamerasListViewModel> {

        //#region Injection

        public static ID = "CamerasListController";

        public static get $inject(): string[] {
            return [
                "$scope",
                "$location",
                Services.Utilities.ID,
                Services.Preferences.ID,
                Services.UiHelper.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private $location: ng.ILocationService,
            private Utilities: Services.Utilities,
            private Preferences: Services.Preferences,
            private UiHelper: Services.UiHelper) {
            super($scope, ViewModels.CamerasListViewModel);
        }

        //#endregion

        //#region BaseController Overrides

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

            this.viewModel.cameras = this.Preferences.cameras;

            if (!this.viewModel.cameras) {
                this.viewModel.cameras = [];
            }
        }

        //#endregion

        //#region Attribute/Expression Properties

        protected get snapshots_show(): boolean {
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

        protected get streaming_show(): boolean {
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
