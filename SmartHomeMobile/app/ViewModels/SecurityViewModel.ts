module JustinCredible.SmartHomeMobile.ViewModels {

    export class SecurityViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;
        public lockData: IrisApiTypes.LocksGetResult;
        public alarmData: IrisApiTypes.AlarmGetResult;
        public alarmOverviewData: IrisApiTypes.AlarmOverviewGetResult;
    }

}