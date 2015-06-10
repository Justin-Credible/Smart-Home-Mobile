module JustinCredible.SmartHomeMobile.Controllers {

    export class PassphraseEntryController extends BaseDialogController<ViewModels.PassphraseEntryViewModel, any, any> {

        public static $inject = ["$scope", "Utilities", "Preferences", "UiHelper"];

        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.PassphraseEntryViewModel, UiHelper.DialogIds.PassphraseEntry);

            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        public dialog_shown() {
            this.viewModel.passphrase = "";
        }

        //#endregion

        //#region Controller Methods

        public ok_click() {
            if (this.Preferences.isPassphraseValid(this.viewModel.passphrase)) {
                this.Preferences.setPassphraseForSession(this.viewModel.passphrase);
                this.close();
            }
            else {
                this.UiHelper.alert("Invalid passphrase; please try again.");
            }
        }

        //#endregion
    }
}
