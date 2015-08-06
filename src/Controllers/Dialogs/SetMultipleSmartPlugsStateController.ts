module JustinCredible.SmartHomeMobile.Controllers {

    export class SetMultipleSmartPlugsStateController extends BaseDialogController<ViewModels.SetMultipleSmartPlugsStateViewModel, AlertMeApiTypes.SmartPlugDevice[], AlertMeApiTypes.SmartPlugDevice[]> {

        //#region Injection

        public static ID = "SetMultipleSmartPlugsStateController";
        public static TemplatePath = "templates/Dialogs/Set-Multiple-Smart-Plugs-State.html";

        public static get $inject(): string[] {
            return [
                "$scope",
                Services.Utilities.ID,
                Services.Preferences.ID,
                Services.UiHelper.ID
            ];
        }

        constructor(
            $scope: ng.IScope,
            private Utilities: Services.Utilities,
            private Preferences: Services.Preferences,
            private UiHelper: Services.UiHelper) {
            super($scope, ViewModels.SetMultipleSmartPlugsStateViewModel, SetMultipleSmartPlugsStateController.ID);
        }

        //#endregion

        //#Region BaseDialogController Overrides

        protected dialog_shown(): void {
            super.dialog_shown();

            this.viewModel.stateChanged = false;
            this.viewModel.smartPlugs = this.getData();
        }

        //#endregion

        //#region Attribute/Expression Properties

        protected get lighting_show(): boolean {
            var outlets: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type lighting.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "LIGHTS";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        protected get outlets_show(): boolean {
            var outlets: AlertMeApiTypes.SmartPlugDevice[];

            // If there is no view model data, then the section shouldn't be visible.
            if (this.viewModel == null || this.viewModel.smartPlugs == null) {
                return false;
            }

            // We want to show the outlets section if we have applicances of type smart plug.
            outlets = _.filter(this.viewModel.smartPlugs, (smartPlug: AlertMeApiTypes.SmartPlugDevice) => {
                return smartPlug.applianceType === "SMARTPLUG";
            });

            // We need at least one to show this section.
            return outlets.length > 0;
        }

        //#endregion

        //#region Controller Methods

        protected cancel_click(): void {
            this.close();
        }

        protected done_click(): void {
            this.close(this.viewModel.smartPlugs);
        }

        protected smartPlugToggle_click(smartPlug: AlertMeApiTypes.SmartPlugDevice): void {

            // If this device was reported as unavailable, then there is nothing to do.
            if (smartPlug.onOffState === Services.AlertMeApi.SmartPlugOnOffState.Unavailable) {
                return;
            }

            this.viewModel.stateChanged = true;
        }

        //#endregion
    }
}
