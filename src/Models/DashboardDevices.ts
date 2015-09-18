module JustinCredible.SmartHomeMobile.Models {

    export class DashboardDevices {

        public lockData: AlertMeApiTypes.LocksGetResult;
        public alarmData: AlertMeApiTypes.AlarmGetResult;
        public alarmOverviewData: AlertMeApiTypes.AlarmOverviewGetResult;

        public smartPlugs: AlertMeApiTypes.SmartPlugDevice[];
    }

}
