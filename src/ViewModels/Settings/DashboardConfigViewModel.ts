module JustinCredible.SmartHomeMobile.ViewModels {

    export class DashboardConfigViewModel {

        public floorplanImageUrl: string;
        public items: Models.DashboardItem[];
        public hasChanges: boolean;
        public showToolbar: boolean;
        public selectedItem: Models.DashboardItem;
    }
}
