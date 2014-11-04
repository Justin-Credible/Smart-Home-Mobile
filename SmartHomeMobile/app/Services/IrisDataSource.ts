module JustinCredible.SmartHomeMobile.Services {

    /**
     * A data source for the Iris API; used to cache data for views etc.
     */
    export class IrisDataSource {

        public static $inject = ["$rootScope", "$q", "IrisApi"];

        private $rootScope: ng.IRootScopeService;
        private $q: ng.IQService;
        private IrisApi: Services.IrisApi;

        constructor($rootScope: ng.IRootScopeService, $q: ng.IQService, IrisApi: Services.IrisApi) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.IrisApi = IrisApi;
        }

        //#region Security

        private _security: ViewModels.SecurityViewModel;
        private _securityLastUpdated: Moment;

        private _locks: IrisApiTypes.LocksGetResult;
        private _locksLastUpdated: Moment;

        private _alarm: IrisApiTypes.AlarmGetResult;
        private _alarmLastUpdated: Moment;

        private _alarmOverview: IrisApiTypes.AlarmOverviewGetResult;
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

        get alarm(): IrisApiTypes.AlarmGetResult {
            return this._alarm;
        }

        get alarmLastUpdated(): Moment {
            return this._alarmLastUpdated;
        }

        public refreshAlarm(): ng.IPromise<IrisApiTypes.AlarmGetResult> {
            var q = this.$q.defer<IrisApiTypes.AlarmGetResult>();

            this.IrisApi.getAlarm().then((result: IrisApiTypes.AlarmGetResult) => {
                this._alarm = result;
                this._alarmLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        get alarmOverview(): IrisApiTypes.AlarmOverviewGetResult {
            return this._alarmOverview;
        }

        get alarmOverviewLastUpdated(): Moment {
            return this._alarmOverviewLastUpdated;
        }

        public refreshAlarmOverview(): ng.IPromise<IrisApiTypes.AlarmOverviewGetResult> {
            var q = this.$q.defer<IrisApiTypes.AlarmOverviewGetResult>();

            this.IrisApi.getAlarmOverview().then((result: IrisApiTypes.AlarmOverviewGetResult) => {
                this._alarmOverview = result;
                this._alarmOverviewLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        get locks(): IrisApiTypes.LocksGetResult {
            return this._locks;
        }

        public refreshLocks(): ng.IPromise<IrisApiTypes.LocksGetResult> {
            var q = this.$q.defer<IrisApiTypes.LocksGetResult>();

            this.IrisApi.getLocks().then((result: IrisApiTypes.LocksGetResult) => {
                this._locks = result;
                this._locksLastUpdated = moment();
                q.resolve(result);
            }, q.reject);

            return q.promise;
        }

        //#endregion

        //#region Smart Plugs

        private _smartPlugs: IrisApiTypes.SmartPlugDevice[];
        private _smartPlugsLastUpdated: Moment;

        get smartPlugs(): IrisApiTypes.SmartPlugDevice[] {
            return this._smartPlugs;
        }

        get smartPlugsLastUpdated(): Moment {
            return this._smartPlugsLastUpdated;
        }

        public refreshSmartPlugs(): ng.IPromise<IrisApiTypes.SmartPlugDevice[]> {
            var q = this.$q.defer<IrisApiTypes.SmartPlugDevice[]>();

            this.IrisApi.getSmartPlugs().then((result: IrisApiTypes.SmartPlugsGetResult) => {
                this._smartPlugs = result.smartplugs;
                this._smartPlugsLastUpdated = moment();
                q.resolve(result.smartplugs);
            });

            return q.promise;
        }

        //#endregion
    }
}