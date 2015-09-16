module JustinCredible.SmartHomeMobile.ViewModels {

    export class DashboardViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public floorplanImageUrl: string;
        public items: Models.DashboardItem[];
        public devices: Models.Dictionary<AlertMeApiTypes.DeviceDescriptor>;
    }
}
