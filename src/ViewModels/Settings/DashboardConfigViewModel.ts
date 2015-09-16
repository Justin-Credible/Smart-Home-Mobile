module JustinCredible.SmartHomeMobile.ViewModels {

    export class DashboardConfigViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public floorplanImageUrl: string;
        public items: Models.DashboardItem[];
        public devices: Models.Dictionary<AlertMeApiTypes.DeviceDescriptor>;
        public hasChanges: boolean;
        public showToolbar: boolean;
        public selectedItem: Models.DashboardItem;
    }
}
