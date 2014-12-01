module JustinCredible.SmartHomeMobile.ViewModels {

    export class SecurityViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;
        public lockData: AlertMeApiTypes.LocksGetResult;
        public alarmData: AlertMeApiTypes.AlarmGetResult;
        public alarmOverviewData: AlertMeApiTypes.AlarmOverviewGetResult;
    }

}