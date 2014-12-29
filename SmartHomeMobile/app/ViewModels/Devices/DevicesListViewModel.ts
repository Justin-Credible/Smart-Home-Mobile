module JustinCredible.SmartHomeMobile.ViewModels {

    export class DevicesListViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public homeStatus: AlertMeApiTypes.HomeStatusGetResult;
        public deviceCount: number;
    }

}