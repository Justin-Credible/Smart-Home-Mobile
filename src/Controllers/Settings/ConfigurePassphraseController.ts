module JustinCredible.SmartHomeMobile.Controllers {

    export class ConfigurePassphraseController extends BaseController<ViewModels.ConfigurePassphraseViewModel> {

        private static USER_PASSPHRASE_ARBITRARY_VALUE = "JustinCredible.SmartHomeMobile.Passphrase.ArbitraryValue";

        public static $inject = ["$scope", "Utilities", "UiHelper", "Preferences"];

        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences) {
            super($scope, ViewModels.ConfigurePassphraseViewModel);

            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
        }

        //#region BaseController Overrides

        public view_beforeEnter(): void {
            this.resetViewModel();
        }

        //#endregion

        //#region Private Methods

        private resetViewModel(): void {
            var isPassphraseConfigured = this.Preferences.isPassphraseConfigured;

            this.viewModel.showField1 = false;
            this.viewModel.showField2 = false;
            this.viewModel.showField3 = false;

            this.viewModel.showSetButton = !isPassphraseConfigured;
            this.viewModel.showChangeButton = isPassphraseConfigured;
            this.viewModel.showRemoveButton = isPassphraseConfigured;

            this.viewModel.isSettingPassphrase = false;
            this.viewModel.isChangingPassphrase = false;
            this.viewModel.isRemovingPassphrase = false;
        }

        //#endregion

        //#region Controller Methods

        protected setPassphrase_click(): void {

            // If we are not in the passphrase setting mode, enter it.
            if (!this.viewModel.isSettingPassphrase) {
                this.viewModel.isSettingPassphrase = true;
                this.viewModel.showField1 = false;
                this.viewModel.showField2 = true;
                this.viewModel.showField3 = true;
                this.viewModel.showSetButton = true;
                this.viewModel.showChangeButton = false;
                this.viewModel.showRemoveButton = false;
                return;
            }

            // Ensure the new passphrase value is not an empty string.
            if (!this.viewModel.passphrase2 || !this.viewModel.passphrase3) {
                this.UiHelper.alert("The new passphrase cannot be empty.");
                return;
            }

            // Ensure the new passphrase values match.
            if (this.viewModel.passphrase2 !== this.viewModel.passphrase3) {
                this.UiHelper.alert("The new passphrases do not match, please try again.");
                return;
            }

            // Set the new passphrase.
            this.Preferences.setPassphrase(this.viewModel.passphrase3);

            // Reset this view.
            this.resetViewModel();
        }

        protected changePassphrase_click(): void {

            // If we are not in the passphrase changing mode, enter it.
            if (!this.viewModel.isChangingPassphrase) {
                this.viewModel.isChangingPassphrase = true;
                this.viewModel.showField1 = true;
                this.viewModel.showField2 = true;
                this.viewModel.showField3 = true;
                this.viewModel.showSetButton = false;
                this.viewModel.showChangeButton = true;
                this.viewModel.showRemoveButton = false;
                return;
            }

            // Ensure the original passphrase is not an empty string.
            if (!this.viewModel.passphrase1) {
                this.UiHelper.alert("Please enter the original passphrase.");
                return;
            }

            // Ensure the new passphrase values match.
            if (this.viewModel.passphrase2 !== this.viewModel.passphrase3) {
                this.UiHelper.alert("The new passphrases do not match, please try again.");
                return;
            }

            var oldPassphrase = this.viewModel.passphrase1;
            var newPassphrase = this.viewModel.passphrase2;

            // Ensure existing passphrase is valid before continuing.
            if (!this.Preferences.isPassphraseValid(oldPassphrase)) {
                this.UiHelper.alert("The original passphrase is not correct, please try again.");
                return;
            }

            // Set the new passphrase.
            this.Preferences.setPassphrase(newPassphrase);

            // Reset this view.
            this.resetViewModel();
        }
        
        protected removePassphrase_click(): void {

            // If we are not in the passphrase removal mode, enter it.
            if (!this.viewModel.isRemovingPassphrase) {
                this.viewModel.isRemovingPassphrase = true;
                this.viewModel.showField1 = true;
                this.viewModel.showField2 = false;
                this.viewModel.showField3 = false;
                this.viewModel.showSetButton = false;
                this.viewModel.showChangeButton = false;
                this.viewModel.showRemoveButton = true;
                return;
            }

            // Ensure the passphrase value is not an empty string.
            if (!this.viewModel.passphrase1) {
                this.UiHelper.alert("The passphrase cannot be empty.");
                return;
            }

            var passphrase = this.viewModel.passphrase1;

            // Ensure existing passphrase is valid before continuing.
            if (!this.Preferences.isPassphraseValid(passphrase)) {
                this.UiHelper.alert("The original passphrase is not correct, please try again.");
                return;
            }

            // Clear out the passphrase.
            this.Preferences.setPassphrase(null);

            // Reset this view.
            this.resetViewModel();
        }

        //#endregion
    }
}
