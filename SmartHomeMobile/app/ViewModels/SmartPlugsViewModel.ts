module JustinCredible.SmartHomeMobile.ViewModels {

    export class SmartPlugsViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;
        public smartPlugs: IrisApiTypes.SmartPlugDevice[];

        /**
         * A map of device IDs to flags that indicate if the update row
         * should be visible for the associated device.
         */
        public showIntensityUpdateButton: { [id: string]: boolean } = {};

        /**
         * A map of device IDs to intensity values; used for storing the
         * previous intensity value so it can be restored if the user
         * chooses to cancel.
         */
        public originalIntensityValues: { [id: string]: number } = {};
    }

}