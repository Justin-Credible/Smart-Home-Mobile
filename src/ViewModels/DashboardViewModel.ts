module JustinCredible.SmartHomeMobile.ViewModels {

    export class DashboardViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public devices: Models.DashboardDevices;
    }
}
