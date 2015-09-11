module JustinCredible.SmartHomeMobile.ViewModels {

    export class DashboardViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public lockData: AlertMeApiTypes.LocksGetResult;
        public alarmData: AlertMeApiTypes.AlarmGetResult;
        public alarmOverviewData: AlertMeApiTypes.AlarmOverviewGetResult;

        public smartPlugs: AlertMeApiTypes.SmartPlugDevice[];
    }
}
