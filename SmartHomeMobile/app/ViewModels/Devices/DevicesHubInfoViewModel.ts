module JustinCredible.SmartHomeMobile.ViewModels {

    export class DevicesHubInfoViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public hub: AlertMeApiTypes.HomeStatusHub;
    }

}