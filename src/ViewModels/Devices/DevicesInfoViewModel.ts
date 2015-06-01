module JustinCredible.SmartHomeMobile.ViewModels {

    export class DevicesInfoViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public device: AlertMeApiTypes.HomeStatusDevice;
    }

}
