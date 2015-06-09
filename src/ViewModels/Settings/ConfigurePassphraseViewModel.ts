module JustinCredible.SmartHomeMobile.ViewModels {

    export class ConfigurePassphraseViewModel {
        public showField1: boolean;
        public showField2: boolean;
        public showField3: boolean;

        public showSetButton: boolean;
        public showChangeButton: boolean;
        public showRemoveButton: boolean;

        public passphrase1: string;
        public passphrase2: string;
        public passphrase3: string;

        public isSettingPassphrase: boolean;
        public isChangingPassphrase: boolean;
        public isRemovingPassphrase: boolean;
    }

}
