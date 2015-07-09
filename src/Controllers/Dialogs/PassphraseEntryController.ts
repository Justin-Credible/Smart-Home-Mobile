module JustinCredible.SmartHomeMobile.Controllers {

    export class PassphraseEntryController extends BaseDialogController<ViewModels.PassphraseEntryViewModel, any, any> {

        public static ID = "PassphraseEntryController";
        public static TemplatePath = "templates/Dialogs/Passphrase-Entry.html";

        public static get $inject(): string[] {
            return ["$scope", Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID];
        }

        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.PassphraseEntryViewModel, PassphraseEntryController.ID);

            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
        }

        //#region BaseController Overrides

        protected dialog_shown() {
            super.dialog_shown();

            this.viewModel.passphrase = "";
        }

        //#endregion

        //#region Controller Methods

        protected ok_click() {
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
