module JustinCredible.SmartHomeMobile.Services {

    /**
     * This is a custom interceptor for Angular's $httpProvider.
     * 
     * It allows us to inject the token into the header, log request and responses,
     * and handle the showing and hiding of the user blocking UI elements, progress
     * bar and spinner.
     * 
     * Note: The $injector service is used to obtain most of the other services that
     * this service depends on so we can avoid circular dependency references on startup.
     */
    export class HttpInterceptor {

        //#region Injection

        public static ID = "HttpInterceptor";

        constructor(
            private $rootScope: ng.IRootScopeService,
            private $injector: ng.auto.IInjectorService,
            private $q: ng.IQService) {
        }

        private get Utilities(): Utilities {
            return this.$injector.get(Utilities.ID);
        }

        private get UiHelper(): UiHelper {
            return this.$injector.get(UiHelper.ID);
        }

        private get Preferences(): Preferences {
            return this.$injector.get(Preferences.ID);
        }

        private get Configuration(): Configuration {
            return this.$injector.get(Configuration.ID);
        }

        private get Logger(): Logger {
            return this.$injector.get(Logger.ID);
        }

        /**
         * This function can be used to return a factory function that Angular can consume
         * when defining an Angular factory. It is basically a wrapper for the HttpInterceptor
         * service so we can do dependency injection and have everything called in the correct
         * context at runtime.
         * 
         * @returns A factory that can be used like this: ngModule.factory(HttpInterceptor.getFactory());
         */
        public static getFactory(): Function {
            var factory: Function;

            // Angular expects the factory function to return the object that is used
            // for the factory when it is injected into other objects.
            factory = function ($rootScope: ng.IRootScopeService, $injector: ng.auto.IInjectorService, $q: ng.IQService) {

                // Create an instance our strongly-typed service.
                var instance = new HttpInterceptor($rootScope, $injector, $q);

                // Return an object that exposes the functions that we want to be exposed.
                // We use bind here so that the correct context is used (Angular normally
                // would just use the context of the window when invoking the functions).
                return {
                    request: _.bind(instance.request, instance),
                    response: _.bind(instance.response, instance),
                    requestError: _.bind(instance.requestError, instance),
                    responseError: _.bind(instance.responseError, instance)
                };
            };

            // Annotate the factory function with the things that should be injected.
            factory.$inject = [
                "$rootScope",
                "$injector",
                "$q"
            ];

            return factory;
        }

        //#endregion

        private requestsInProgress: number = 0;
        private blockingRequestsInProgress: number = 0;
        private spinnerRequestsInProgress: number = 0;

        //#region HttpInterceptor specific methods

        /**
         * Fired when an HTTP request is being made. This is where the configuration
         * object (eg URL, HTTP headers, etc) can be modified before the request goes
         * out.
         */
        public request(config: Interfaces.RequestConfig): Interfaces.RequestConfig {

            // Do nothing for Angular's template requests.
            if (this.Utilities.endsWith(config.url, ".html")) {
                return config;
            }

            console.log("HttpInterceptor.request: " + config.url, [config]);

            // Log the request data to disk.
            if (this.Configuration.enableFullHttpLogging) {
                this.Logger.logHttpRequestConfig(config);
            }

            // Keep track of how many requests are in progress and show spinners etc.
            this.handleRequestStart(config);

            return config;
        }

        /**
         * Fired when an HTTP request completes with a status code in the 200 range.
         */
        public response(httpResponse: ng.IHttpPromiseCallbackArg<any>): ng.IHttpPromiseCallbackArg<any> {
            var config: Interfaces.RequestConfig;

            // Cast to our custom type which includes some extra flags.
            config = <Interfaces.RequestConfig>httpResponse.config;

            // Do nothing for Angular's template requests.
            if (this.Utilities.endsWith(config.url, ".html")) {
                return httpResponse;
            }

            console.log("HttpInterceptor.response: " + httpResponse.config.url, [httpResponse]);

            // Log the response data to disk.
            if (this.Configuration.enableFullHttpLogging) {
                this.Logger.logHttpResponse(httpResponse);
            }

            // Keep track of how many requests are still in progress and hide spinners etc.
            this.handleResponseEnd(config);

            return httpResponse;
        }

        /**
         * Fired when there is an unhandled exception (eg JavaScript error) in the HttpInterceptor.request
         * OR when there are problems with the request going out.
         */
        public requestError(rejection: ng.IHttpPromiseCallbackArg<any>) {
            var httpResponse: ng.IHttpPromiseCallbackArg<any>,
                exception: Error,
                config: Interfaces.RequestConfig;

            console.error("HttpInterceptor.requestError", [rejection]);

            if (rejection instanceof Error) {
                // Occurs for any uncaught exceptions that occur in other interceptors.
                exception = <Error>rejection;
                this.Logger.logError("An request exception was encountered in the HttpInterceptor.requestError().", exception);
                this.handleFatalError();
            }
            else {
                // Occurs if any other interceptors reject the request.
                this.Logger.logError("An request rejection was encountered in the HttpInterceptor.requestError().", null);

                httpResponse = <ng.IHttpPromiseCallbackArg<any>>rejection;

                // Cast to our custom type which includes some extra flags.
                config = <Interfaces.RequestConfig>httpResponse.config;

                // Keep track of how many requests are still in progress and hide spinners etc.
                if (config) {
                    this.handleResponseEnd(config);
                }
            }

            return this.$q.reject(rejection);
        }

        /**
         * Fired when a response completes with a non-200 level status code.
         * 
         * Additionally, this can fire when there are uncaught exceptions (eg JavaScript errors)
         * in the HttpInterceptor response method.
         */
        public responseError(responseOrError: any) {
            var httpResponse: ng.IHttpPromiseCallbackArg<any>,
                exception: Error,
                config: Interfaces.RequestConfig;

            console.log("HttpInterceptor.responseError", [responseOrError]);

            if (responseOrError instanceof Error) {
                exception = <Error>responseOrError;
                this.Logger.logError("An response error was encountered in the HttpInterceptor.responseError().", exception);
                this.handleFatalError();
            }
            else {
                httpResponse = <ng.IHttpPromiseCallbackArg<any>>responseOrError;

                // Cast to our custom type which includes some extra flags.
                config = <Interfaces.RequestConfig>httpResponse.config;

                // Do nothing for Angular's template requests.
                if (this.Utilities.endsWith(config.url, ".html")) {
                    return this.$q.reject(responseOrError);
                }

                // Always log error responses.
                this.Logger.logHttpResponse(httpResponse);

                // Keep track of how many requests are still in progress and hide spinners etc.
                this.handleResponseEnd(config);

                // Broadcast an error so other parts of the are aware.
                this.$rootScope.$broadcast(Constants.Events.HTTP_ERROR, httpResponse);
            }

            return this.$q.reject(responseOrError);
        }

        //#endregion

        //#region Private Helpers

        /**
         * Handles keeping track of the number of requests that are currently in progress as well
         * as shows any UI blocking or animated spinners.
         */
        private handleRequestStart(config: Interfaces.RequestConfig) {

            // Default the blocking flag if it isn't present.
            if (typeof (config.blocking) === "undefined") {
                config.blocking = true;
            }

            // Default the show spinner flag if it isn't present.
            if (typeof (config.showSpinner) === "undefined") {
                config.showSpinner = true;
            }

            // Increment the total number of HTTP requests that are in progress.
            this.requestsInProgress += 1;

            // If this request should block the UI, then we have extra work to do.
            if (config.blocking) {

                // Increment the total number of HTTP requests that are in progress that
                // are also currently blocking the UI.
                this.blockingRequestsInProgress += 1;

                // If this wasn't the first blocking HTTP request, we need to hide the previous
                // blocking progress indicator before we show the new one on iOS because the iOS
                // plugin will create a new instance and hide only operates on the last instance.
                // If we don't do this here, it will result in being unable to hide progress
                // indicators when multiple are shown.
                if (this.Utilities.isIos && this.blockingRequestsInProgress > 1) {
                    this.UiHelper.progressIndicator.hide();
                }

                // Show the blocking progress indicator with or without text.
                if (config.blockingText) {
                    this.UiHelper.progressIndicator.showSimpleWithLabel(true, config.blockingText);
                }
                else {
                    this.UiHelper.progressIndicator.showSimple(true);
                }

                // Let the rest of the application know that blocking requests are in progress.
                /* tslint:disable:no-string-literal */
                this.$rootScope.$broadcast(Constants.Events.HTTP_BLOCKING_REQUEST_STARTED);
                this.$rootScope["blockingRequestInProgress"] = true;
                /* tslint:enable:no-string-literal */
            }

            // If this request should show the spinner, then we have extra work to do.
            if (config.showSpinner) {

                // Increment the total number of HTTP requests that are in progress that
                // are also currently showing the spinner.
                this.spinnerRequestsInProgress += 1;

                // If the spinner isn't already visible, then show it.
                if (!NProgress.isStarted()) {
                    NProgress.start();
                }

                // Let the rest of the application know that non-blocking requests are in progress.
                /* tslint:disable:no-string-literal */
                this.$rootScope.$broadcast(Constants.Events.HTTP_NON_BLOCKING_REQUEST_STARTED);
                this.$rootScope["nonBlockingRequestInProgress"] = true;
                /* tslint:enable:no-string-literal */
            }
        }

        /**
         * This method should be called when there is a fatal error during one of our interceptor
         * methods. It ensures that all of the progress bars and overlays are removed from the
         * screen so we don't block the user.
         */
        private handleFatalError() {
            this.requestsInProgress = 0;
            this.blockingRequestsInProgress = 0;
            this.spinnerRequestsInProgress = 0;

            /* tslint:disable:no-string-literal */
            this.$rootScope["nonBlockingRequestInProgress"] = false;
            this.$rootScope["blockingRequestInProgress"] = false;
            /* tslint:enable:no-string-literal */

            NProgress.done();
            this.UiHelper.progressIndicator.hide();

            let error: ng.IHttpPromiseCallbackArg<any> = {
                status: 0,
                statusText: "Fatal error occurred in HttpInterceptor."
            };

            this.$rootScope.$broadcast(Constants.Events.HTTP_ERROR, error);
        }

        /**
         * Handles keeping track of the number of requests that are currently in progress as well
         * as hides any UI blocking or animated spinners.
         */
        private handleResponseEnd(config: Interfaces.RequestConfig) {

            // Decrement the total number of HTTP requests that are in progress.
            this.requestsInProgress -= 1;

            // If this was a blocking request, also decrement the blocking counter.
            if (config.blocking) {
                this.blockingRequestsInProgress -= 1;
            }
            // If this was a spinner request, also decrement the spinner counter.
            if (config.showSpinner) {
                this.spinnerRequestsInProgress -= 1;
            }

            // If there are no more blocking requests in progress, then hide the blocker.
            if (config.blocking && this.blockingRequestsInProgress === 0) {
                this.UiHelper.progressIndicator.hide();

                // Let the rest of the application know that all blocking requests are finished.
                /* tslint:disable:no-string-literal */
                this.$rootScope.$broadcast(Constants.Events.HTTP_BLOCKING_REQUESTS_COMPLETED);
                this.$rootScope["blockingRequestInProgress"] = false;
                /* tslint:enable:no-string-literal */
            }

            if (config.showSpinner && this.spinnerRequestsInProgress === 0) {
                // If there are no more spinner requests in progress, then hide the spinner.
                NProgress.done();

                // Let the rest of the application know that all non-blocking requests are finished.
                /* tslint:disable:no-string-literal */
                this.$rootScope.$broadcast(Constants.Events.HTTP_NON_BLOCKING_REQUESTS_COMPLETED);
                this.$rootScope["nonBlockingRequestInProgress"] = false;
                /* tslint:enable:no-string-literal */
            }
            else if (config.showSpinner) {
                // If there are still spinner requests in progress, then kick up the progress
                // bar a little bit to show some of the work has completed.
                NProgress.inc();
            }
        }

        /**
         * Used to create a header value for use with the basic Authorization HTTP header using
         * the given user name and password value.
         * 
         * http://en.wikipedia.org/wiki/Basic_access_authentication
         * 
         * @param The user name to use.
         * @param The password to use.
         * @returns A value to use for the HTTP Authorization header.
         */
        private getAuthorizationHeader(userName: string, password: string): string {
            var headerValue: string;

            // Concatenate the user name and password with a colon.
            headerValue = this.Utilities.format("{0}:{1}", userName, password);

            // Base64 encode the user name and password and prepend "Basic".
            return "Basic " + btoa(headerValue);
        }

        //#endregion
    }
}
