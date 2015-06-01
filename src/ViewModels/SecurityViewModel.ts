module JustinCredible.SmartHomeMobile.ViewModels {

    export class SecurityViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;

        public lockData: AlertMeApiTypes.LocksGetResult;
        public alarmData: AlertMeApiTypes.AlarmGetResult;
        public alarmOverviewData: AlertMeApiTypes.AlarmOverviewGetResult;

        /**
         * If set to a non-zero value, indicates how much time is remaining during the
         * grace period for the alarm. This is used to provide a countdown in the UI.
         */
        public armingGracePeriodRemaining: number;

        /**
         * Indicates if the next call to armAlarm() should ignore open contact sensors or
         * unlocked locks.
         */
        public forceArm: boolean;

        /**
         * Used for a setInterval() call to countdown the time remaining.
         */
        public gracePeriodIntervalRef: number;
    }

}
