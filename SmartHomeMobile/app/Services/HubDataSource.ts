module JustinCredible.SmartHomeMobile.Services {

    /**
     * A data source for the AlertMe API; used to cache data for views etc.
     */
    export class HubDataSource {

        public static $inject = ["$rootScope", "$q", "AlertMeApi"];

        private $rootScope: ng.IRootScopeService;
        private $q: ng.IQService;
        private AlertMeApi: Services.AlertMeApi;

        constructor($rootScope: ng.IRootScopeService, $q: ng.IQService, AlertMeApi: Services.AlertMeApi) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.AlertMeApi = AlertMeApi;
        }

        //#region Security

        private _security: ViewModels.SecurityViewModel;
        private _securityLastUpdated: Moment;

        private _locks: AlertMeApiTypes.LocksGetResult;
        private _locksLastUpdated: Moment;

        private _alarm: AlertMeApiTypes.AlarmGetResult;
        private _alarmLastUpdated: Moment;

        private _alarmOverview: AlertMeApiTypes.AlarmOverviewGetResult;
        private _alarmOverviewLastUpdated: Moment;

        get security(): ViewModels.SecurityViewModel {
            return this._security;
        }

        get securityLastUpdated(): Moment {
            return this._securityLastUpdated;
        }

        public refreshSecurity(): ng.IPromise<ViewModels.SecurityViewModel> {
            var q = this.$q.defer<ViewModels.SecurityViewModel>();

            this.$q.all([
                this.refreshAlarm(),
                this.refreshAlarmOverview(),
                this.refreshLocks()
            ]).then(() => {
                this._security = new ViewModels.SecurityViewModel();

                this._security.alarmData = this._alarm;
                this._security.alarmOverviewData = this._alarmOverview;
                this._security.lockData = this._locks;

                this._securityLastUpdated = moment();
                this._alarmLastUpdated = moment();
                this._alarmOverviewLastUpdated = moment();
                this._locksLastUpdated = moment();

                q.resolve(this._security);
            }, q.reject);

            return q.promise;
        }

        get alarm(): AlertMeApiTypes.AlarmGetResult {
            return this._alarm;
        }

        get alarmLastUpdated(): Moment {
            return this._alarmLastUpdated;
        }

        public refreshAlarm(): ng.IPromise<AlertMeApiTypes.AlarmGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmGetResult>();

            this.AlertMeApi.getAlarm().then((result: AlertMeApiTypes.AlarmGetResult) => {
                this._alarm = result;
                this._alarmLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        get alarmOverview(): AlertMeApiTypes.AlarmOverviewGetResult {
            return this._alarmOverview;
        }

        get alarmOverviewLastUpdated(): Moment {
            return this._alarmOverviewLastUpdated;
        }

        public refreshAlarmOverview(): ng.IPromise<AlertMeApiTypes.AlarmOverviewGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.AlarmOverviewGetResult>();

            this.AlertMeApi.getAlarmOverview().then((result: AlertMeApiTypes.AlarmOverviewGetResult) => {
                this._alarmOverview = result;
                this._alarmOverviewLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        get locks(): AlertMeApiTypes.LocksGetResult {
            return this._locks;
        }

        public refreshLocks(): ng.IPromise<AlertMeApiTypes.LocksGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.LocksGetResult>();

            this.AlertMeApi.getLocks().then((result: AlertMeApiTypes.LocksGetResult) => {
                this._locks = result;
                this._locksLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Smart Plugs

        private _smartPlugs: AlertMeApiTypes.SmartPlugDevice[];
        private _smartPlugsLastUpdated: Moment;

        get smartPlugs(): AlertMeApiTypes.SmartPlugDevice[] {
            return this._smartPlugs;
        }

        get smartPlugsLastUpdated(): Moment {
            return this._smartPlugsLastUpdated;
        }

        public refreshSmartPlugs(): ng.IPromise<AlertMeApiTypes.SmartPlugDevice[]> {
            var q = this.$q.defer<AlertMeApiTypes.SmartPlugDevice[]>();

            this.AlertMeApi.getSmartPlugs().then((result: AlertMeApiTypes.SmartPlugsGetResult) => {
                this._smartPlugs = result.smartplugs;
                this._smartPlugsLastUpdated = moment();
                q.resolve(result.smartplugs);
            });

            return q.promise;
        }

        //#endregion

        //#region Thermostat

        private _climate: AlertMeApiTypes.ClimateGetResult;
        private _climateLastUpdated: Moment;

        get climate(): AlertMeApiTypes.ClimateGetResult {
            return this._climate;
        }

        get climateLastUpdated(): Moment {
            return this._climateLastUpdated;
        }

        public refreshClimate(deviceId?: string): ng.IPromise<AlertMeApiTypes.ClimateGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.ClimateGetResult>();

            this.AlertMeApi.getClimate(deviceId).then((result: AlertMeApiTypes.ClimateGetResult) => {
                this._climate = result;
                this._climateLastUpdated = moment();
                q.resolve(result);
            });

            return q.promise;
        }

        //#endregion

        //#region Home Status

        private _homeStatus: AlertMeApiTypes.HomeStatusGetResult;
        private _homeStatusLastUpdated: Moment;

        get homeStatus(): AlertMeApiTypes.HomeStatusGetResult {
            return this._homeStatus;
        }

        get homeStatusLastUpdated(): Moment {
            return this._homeStatusLastUpdated;
        }

        public refreshHomeStatus(): ng.IPromise<AlertMeApiTypes.HomeStatusGetResult> {
            var q = this.$q.defer<AlertMeApiTypes.HomeStatusGetResult>();

            this.AlertMeApi.getHomeStatus().then((result: AlertMeApiTypes.HomeStatusGetResult) => {
                this._homeStatus = result;
                this._homeStatusLastUpdated = moment();
                q.resolve(result);
            });

            return q.promise;
        }

        //#endregion
    }
}