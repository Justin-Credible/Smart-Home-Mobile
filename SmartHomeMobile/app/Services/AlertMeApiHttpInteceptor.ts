module JustinCredible.SmartHomeMobile.Services {

    /**
     * This is a custom interceptor for the AlertMe API HTTP requests.
     * 
     * It allows us to seamlessly handle re-authentication for 401's.
     * 
     * NOTE: Unfortunately, due to a circular dependency of
     *       $http <- AlertMeApiHttpInteceptor <- $http <- $ionicTemplateCache
     * and
     *       $http <- AlertMeApi <- AlertMeApiHttpInteceptor <- $http <- $ionicTemplateCache
     * 
     * we have to use the $injector service to grab the $http and AlertMeApi services at runtime.
     */
    export class AlertMeApiHttpInteceptor {

        private $rootScope: ng.IRootScopeService;
        private $q: ng.IQService;
        private $injector: ng.auto.IInjectorService;
        private Preferences: Services.Preferences;
        private Utilities: Utilities;
        private Logger: Services.Logger;

        private requestsInProgress: number;
        private blockingRequestsInProgress: number;
        private spinnerRequestsInProgress: number;

        constructor($rootScope: ng.IRootScopeService, $q: ng.IQService, $injector: ng.auto.IInjectorService, Preferences: Services.Preferences, Utilities: Services.Utilities, Logger: Services.Logger) {
            this.$rootScope = $rootScope;
            this.$q = $q;
            this.$injector = $injector;
            this.Preferences = Preferences;
            this.Utilities = Utilities;
            this.Logger = Logger;

            this.requestsInProgress = 0;
            this.blockingRequestsInProgress = 0;
            this.spinnerRequestsInProgress = 0;
        }

        /**
         * This function can be used to return a factory function that Angular can consume
         * when defining an Angular factory. It is basically a wrapper for the interceptor
         * service so we can do dependency injection and have everything called in the correct
         * context at runtime.
         * 
         * @returns A factory that can be used like this: ngModule.factory(AlertMeApiHttpInteceptor.getFactory());
         */
        public static getFactory(): Function {
            var factory: Function;

            // Angular expects the factory function to return the object that is used
            // for the factory when it is injected into other objects.
            factory = function ($rootScope: ng.IRootScopeService, $q: ng.IQService, $injector: ng.auto.IInjectorService, Preferences: Services.Preferences, Utilities: Services.Utilities, Logger: Services.Logger) {
                // Create an instance our strongly-typed service.
                var instance = new AlertMeApiHttpInteceptor($rootScope, $q, $injector, Preferences, Utilities, Logger);

                // Return an object that exposes the functions that we want to be exposed.
                // We use bind here so that the correct context is used (Angular normally
                // would just use the context of the window when invoking the functions).
                return {
                    responseError: _.bind(instance.responseError, instance)
                };
            };

            // Annotate the factory function with the things that should be injected.
            factory.$inject = ["$rootScope", "$q", "$injector", "Preferences", "Utilities", "Logger"];

            return factory;
        }

        //#region HttpInterceptor specific methods

        /**
         * Fired when a response completes with a non-200 level status code.
         */
        public responseError(responseOrError: any) {
            var $http: ng.IHttpService,
                AlertMeApi: Services.AlertMeApi,
                httpResponse: ng.IHttpPromiseCallbackArg<any>,
                exception: Error,
                config: Interfaces.RequestConfig,
                q = this.$q.defer<any>();

            console.log("AlertMeApiHttpInteceptor.responseError", [httpResponse]);

            if (responseOrError instanceof Error) {
                exception = <Error>responseOrError;
                this.Logger.logError("An response error was encountered in the HttpInterceptorAlertMeApiHttpInteceptor.responseError().", exception);
                return this.$q.reject(responseOrError);
            }

            httpResponse = <ng.IHttpPromiseCallbackArg<any>>responseOrError;

            // Cast to our custom type which includes some extra flags.
            config = <Interfaces.RequestConfig>httpResponse.config;

            // Do nothing for special for API requests to non-AlertMe API URLs.
            if (config.url.indexOf(this.Preferences.alertMeApiUrl) === -1) {
                return this.$q.reject(responseOrError);
            }

            // Do nothing special for API requests to /login (we don't want to end up in an infinite loop).
            if (config.url.indexOf("/login") > -1) {
                return this.$q.reject(responseOrError);
            }

            // Do nothing special for API requests to /logout.
            if (config.url.indexOf("/logout") > -1) {
                return this.$q.reject(responseOrError);
            }

            if (httpResponse.status === 401) {

                // If this API request failed with a 401 unauthorized, then lets see if we can handle it
                // by re-authenticating and then re-issuing the orignial request.

                // Grab a reference to the AlertMeAPi service.
                AlertMeApi = this.$injector.get("AlertMeApi");

                // Grab a reference to the HTTP service.
                $http = this.$injector.get("$http");

                // Make a call to re-authenticate.
                AlertMeApi.login().then((loginResult: AlertMeApiTypes.LoginResult) => {

                    // If the re-authentication was successful, then re-issue the original request.
                    $http(config).then((result: ng.IHttpPromiseCallbackArg<any>) => {
                        q.resolve(result);
                    }, q.reject);

                }, (loginError: any) => {
                    // If the re-authentication failed, then issue a rejection.
                    q.reject(loginError);
                });
            }
            else {
                // We don't need to do anything special for non-401s.
                q.reject(httpResponse);
            }

            return q.promise;
        }

        //#endregion
    }
}