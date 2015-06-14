
module JustinCredible.SmartHomeMobile.Application {

    //#region Variables

    /**
     * The root Angular application module.
     */
    var ngModule: ng.IModule;

    /**
     * Indicates if the PIN or passphrase entry dialogs are currently being shown. This is
     * used to determine if the device_pause event should update the lastPausedAt timestamp
     * (we don't want to update the timestamp if the dialog is open because it will allow the
     * user to pause and then kill the app and bypass the PIN entry screen on next resume).
     */
    var isShowingSecurityPrompt: boolean;

    //#endregion

    /**
     * This is the main entry point for the application. It is used to setup Angular and
     * configure its controllers, services, etc.
     * 
     * It is invoked via the Main.js script included from the index.html page.
     */
    export function main(): void {
        var versionInfo: Interfaces.VersionInfo;

        // Set the default error handler for all uncaught exceptions.
        window.onerror = window_onerror;

        versionInfo = {
            applicationName: "Smart Home Mobile",
            copyrightInfoUrl: "https://github.com/Justin-Credible/Smart-Home-Mobile/blob/master/LICENSE",
            websiteUrl: "http://www.justin-credible.net",
            githubUrl: "https://github.com/Justin-Credible",
            email: "justin.unterreiner@gmail.com",
            majorVersion: window.buildVars.majorVersion,
            minorVersion: window.buildVars.minorVersion,
            buildVersion: window.buildVars.buildVersion,
            versionString: window.buildVars.majorVersion + "." + window.buildVars.minorVersion + "." + window.buildVars.buildVersion,
            buildTimestamp: window.buildVars.buildTimestamp
        };

        // Define the top level Angular module for the application.
        ngModule = angular.module("JustinCredible.SmartHomeMobile.Application", ["ui.router", "ionic", "ngMockE2E", "angular.filter"]);

        // Define our constants.
        ngModule.constant("isRipple", !!(window.parent && window.parent.ripple));
        ngModule.constant("isCordova", typeof(cordova) !== "undefined");
        ngModule.constant("isDebug", window.buildVars.debug);
        ngModule.constant("isChromeExtension", typeof (chrome) !== "undefined" && typeof (chrome.runtime) !== "undefined" && typeof (chrome.runtime.id) !== "undefined");
        ngModule.constant("versionInfo", versionInfo);

        // Define each of the services.
        ngModule.service("Utilities", Services.Utilities);
        ngModule.service("FileUtilities", Services.FileUtilities);
        ngModule.service("Logger", Services.Logger);
        ngModule.service("Preferences", Services.Preferences);
        ngModule.service("MockPlatformApis", Services.MockPlatformApis);
        ngModule.service("MockHttpApis", Services.MockHttpApis);
        ngModule.factory("HttpInterceptor", Services.HttpInterceptor.getFactory());
        ngModule.factory("AlertMeApiHttpInteceptor", Services.AlertMeApiHttpInteceptor.getFactory());
        ngModule.service("UiHelper", Services.UiHelper);
        ngModule.service("AlertMeApi", Services.AlertMeApi);
        ngModule.service("HubDataSource", Services.HubDataSource);

        // Define each of the directives.
        ngModule.directive("iconPanel", getDirectiveFactoryFunction(Directives.IconPanelDirective));
        ngModule.directive("shmOnLoad", ["$parse", ($parse: ng.IParseService) => { return new Directives.OnLoadDirective($parse); }]);
        //ngModule.directive("ngModelOnblur", () => { return new Directives.ModelOnBlurDirective(); });

        // Define each of the filters.
        ngModule.filter("ObjectToArray", getFilterFactoryFunction(Filters.ObjectToArrayFilter.filter));
        ngModule.filter("TitleCase", getFilterFactoryFunction(Filters.TitleCaseFilter.filter));
        ngModule.filter("Thousands", getFilterFactoryFunction(Filters.ThousandsFilter.filter));

        // Define each of the controllers.

        // Root View
        ngModule.controller("MenuController", Controllers.MenuController);

        // Main Views
        ngModule.controller("SecurityController", Controllers.SecurityController);
        ngModule.controller("ThermostatController", Controllers.ThermostatController);
        ngModule.controller("SmartPlugsController", Controllers.SmartPlugsController);
        ngModule.controller("CamerasController", Controllers.CamerasController);
        ngModule.controller("CameraViewController", Controllers.CameraViewController);
        //ngModule.controller("IrrigationController", Controllers.IrrigationController);

        // Settings
        ngModule.controller("SettingsListController", Controllers.SettingsListController);
        ngModule.controller("DevicesListController", Controllers.DevicesListController);
        ngModule.controller("DevicesHubInfoController", Controllers.DevicesHubInfoController);
        ngModule.controller("DevicesInfoController", Controllers.DevicesInfoController);
        ngModule.controller("HubController", Controllers.HubController);
        ngModule.controller("CamerasListController", Controllers.CamerasListController);
        ngModule.controller("CameraEditController", Controllers.CameraEditController);
        ngModule.controller("ConfigurePinController", Controllers.ConfigurePinController);
        ngModule.controller("ConfigurePassphraseController", Controllers.ConfigurePassphraseController);
        ngModule.controller("AboutController", Controllers.AboutController);

        // Dialogs
        ngModule.controller("PinEntryController", Controllers.PinEntryController);
        ngModule.controller("SetMultipleSmartPlugsStateController", Controllers.SetMultipleSmartPlugsStateController);
        ngModule.controller("ReorderCategoriesController", Controllers.ReorderCategoriesController);
        ngModule.controller("PassphraseEntryController", Controllers.PassphraseEntryController);

        // Developer
        ngModule.controller("LogsController", Controllers.LogsController);
        ngModule.controller("LogEntryController", Controllers.LogEntryController);
        ngModule.controller("DeveloperController", Controllers.DeveloperController);

        // Specify the initialize/run and configuration functions.
        ngModule.run(angular_initialize);
        ngModule.config(angular_configure);
    }

    //#region Helpers

    /**
     * Used to create a function that returns a data structure describing an Angular directive
     * from one of our own classes implementing IDirective. It handles creating the 
     * 
     * @param Directive A class reference (not instance) to a directive class that implements Directives.IDirective.
     */
    function getDirectiveFactoryFunction(Directive: Directives.IDirectiveClass): () => ng.IDirective {
        var descriptor: ng.IDirective = {};

        /* tslint:disable:no-string-literal */

        // Here we set the options for the Angular directive descriptor object.
        // We get these values from the static fields on the class reference.
        descriptor.restrict = Directive["restrict"];
        descriptor.template = Directive["template"];
        descriptor.replace = Directive["replace"];
        descriptor.transclude = Directive["transclude"];
        descriptor.scope = Directive["scope"];

        /* tslint:enable:no-string-literal */

        // Here we define the link function that Angular invokes when it is linking the
        // directive to the element.
        descriptor.link = (scope: ng.IScope, instanceElement: ng.IAugmentedJQuery, instanceAttributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction): void => {

            // New up the instance of our directive class.
            var instance = <Directives.IDirective>new Directive(scope, instanceElement, instanceAttributes, controller, transclude);

            // Delegate to the render method.
            instance.render();
        };

        // Finally, return a function that returns this Angular directive descriptor object.
        return function () { return descriptor; };
    }

    /**
     * Used to create a function that returns a function for use by a filter.
     * 
     * @param fn The function that will provide the filter's logic.
     */
    function getFilterFactoryFunction(fn: Function): () => Function {
        return function () { return fn; };
    }

    //#endregion

    //#region Platform Configuration

    /**
     * The main initialize/run function for Angular; fired once the AngularJs framework is done loading.
     */
    function angular_initialize($rootScope: ng.IScope, $location: ng.ILocationService, $ionicViewService: any, $ionicPlatform: Ionic.IPlatform, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, MockHttpApis: Services.MockHttpApis): void {

        // Once AngularJs has loaded we'll wait for the Ionic platform's ready event.
        // This event will be fired once the device ready event fires via Cordova.
        $ionicPlatform.ready(function () {
            ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences);
        });

        // Mock up or allow HTTP responses.
        MockHttpApis.mockHttpCalls(Preferences.enableMockHttpCalls);
    };

    /**
     * Fired once the Ionic framework determines that the device is ready.
     * 
     * Note that this will not fire in the Ripple emulator because it relies
     * on the Codrova device ready event.
     */
    function ionicPlatform_ready($rootScope: ng.IScope, $location: ng.ILocationService, $ionicViewService: any, $ionicPlatform: Ionic.IPlatform, UiHelper: Services.UiHelper, Utilities: Services.Utilities, Preferences: Services.Preferences): void {

        // Subscribe to device events.
        document.addEventListener("pause", _.bind(device_pause, null, Preferences));
        document.addEventListener("resume", _.bind(device_resume, null, $location, $ionicViewService, Utilities, UiHelper, Preferences));
        document.addEventListener("menubutton", _.bind(device_menuButton, null, $rootScope));

        // Subscribe to Angular events.
        $rootScope.$on("$locationChangeStart", angular_locationChangeStart);

        // Now that the platform is ready, we'll delegate to the resume event.
        // We do this so the same code that fires on resume also fires when the
        // application is started for the first time.
        device_resume($location, $ionicViewService, Preferences, UiHelper);
    }

    /**
     * Function that is used to configure AngularJs.
     */
    function angular_configure($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider, $provide: ng.auto.IProvideService, $httpProvider: ng.IHttpProvider, $compileProvider: ng.ICompileProvider): void {

        // Intercept the default Angular exception handler.
        $provide.decorator("$exceptionHandler", function ($delegate: ng.IExceptionHandlerService) {
            return function (exception, cause) {
                // Delegate to our custom handler.
                angular_exceptionHandler(exception, cause);

                // Delegate to the default/base Angular behavior.
                $delegate(exception, cause);
            };
        });

        // Whitelist several URI schemes to prevent Angular from marking them as un-safe.
        // http://stackoverflow.com/questions/19590818/angularjs-and-windows-8-route-error
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0|chrome-extension):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx|x-wmapp0):|data:image\//);

        // Register our custom interceptor with the HTTP provider so we can hook into AJAX request events.
        $httpProvider.interceptors.push("HttpInterceptor");

        // Register our custom interceptor with the HTTP provider so we can seamlessly handle 401s and
        // re-authentication for the AlertMe API requests.
        $httpProvider.interceptors.push("AlertMeApiHttpInteceptor");

        // Setup all of the client side routes and their controllers and views.
        setupAngularRoutes($stateProvider, $urlRouterProvider);

        // If mock API calls are enabled, then we'll add a random delay for all HTTP requests to simulate
        // network latency so we can see the spinners and loading bars. Useful for demo purposes.
        if (localStorage.getItem("ENABLE_MOCK_HTTP_CALLS") === "true") {
            Services.MockHttpApis.setupMockHttpDelay($provide);
        }
    };

    /**
     * Used to define all of the client-side routes for the application.
     * This maps routes to the controller/view that should be used.
     */
    function setupAngularRoutes($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider): void {

        // Setup an abstract state for the tabs directive.
        $stateProvider.state("app", {
            url: "/app",
            abstract: true,
            templateUrl: "templates/Menu.html",
            controller: "MenuController"
        });

        // An blank view useful as a place holder etc.
        $stateProvider.state("app.blank", {
            url: "/blank",
            views: {
                "menuContent": {
                    templateUrl: "templates/Blank.html"
                }
            }
        });

        //#region Main Application Areas

        $stateProvider.state("app.security", {
            url: "/security",
            views: {
                "menuContent": {
                    templateUrl: "templates/Security.html",
                    controller: "SecurityController"
                }
            }
        });

        $stateProvider.state("app.thermostat", {
            url: "/thermostat",
            views: {
                "menuContent": {
                    templateUrl: "templates/Thermostat.html",
                    controller: "ThermostatController"
                }
            }
        });

        $stateProvider.state("app.smart-plugs", {
            url: "/smart-plugs",
            views: {
                "menuContent": {
                    templateUrl: "templates/Smart-Plugs.html",
                    controller: "SmartPlugsController"
                }
            }
        });

        $stateProvider.state("app.cameras", {
            url: "/cameras",
            views: {
                "menuContent": {
                    templateUrl: "templates/Cameras.html",
                    controller: "CamerasController"
                }
            }
        });

        $stateProvider.state("app.camera", {
            url: "/camera/:id",
            views: {
                "menuContent": {
                    templateUrl: "templates/Camera-View.html",
                    controller: "CameraViewController"
                }
            }
        });

        /*
        $stateProvider.state("app.irrigation", {
            url: "/irrigation",
            views: {
                "menuContent": {
                    templateUrl: "templates/Irrigation.html",
                    controller: "IrrigationController"
                }
            }
        });
        */

        $stateProvider.state("app.devices-list", {
            url: "/devices/list",
            views: {
                "menuContent": {
                    templateUrl: "templates/Devices/Devices-List.html",
                    controller: "DevicesListController"
                }
            }
        });

        $stateProvider.state("app.devices-hub-info", {
            url: "/devices/hub",
            views: {
                "menuContent": {
                    templateUrl: "templates/Devices/Devices-Hub-Info.html",
                    controller: "DevicesHubInfoController"
                }
            }
        });

        $stateProvider.state("app.devices-info", {
            url: "/devices/info/:deviceId",
            views: {
                "menuContent": {
                    templateUrl: "templates/Devices/Devices-Info.html",
                    controller: "DevicesInfoController"
                }
            }
        });

        //#endregion

        //#region Settings

        $stateProvider.state("app.settings-list", {
            url: "/settings/list",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Settings-List.html",
                    controller: "SettingsListController"
                }
            }
        });

        $stateProvider.state("app.hub", {
            url: "/settings/hub",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Hub.html",
                    controller: "HubController"
                }
            }
        });

        $stateProvider.state("app.cameras-list", {
            url: "/settings/cameras",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Cameras-List.html",
                    controller: "CamerasListController"
                }
            }
        });

        $stateProvider.state("app.camera-add", {
            url: "/settings/camera/add",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Camera-Edit.html",
                    controller: "CameraEditController"
                }
            }
        });

        $stateProvider.state("app.camera-edit", {
            url: "/settings/camera/edit/:id",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Camera-Edit.html",
                    controller: "CameraEditController"
                }
            }
        });

        $stateProvider.state("app.configure-pin", {
            url: "/settings/configure-pin",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Configure-Pin.html",
                    controller: "ConfigurePinController"
                }
            }
        });

        $stateProvider.state("app.configure-passphrase", {
            url: "/settings/configure-passphrase",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Configure-Passphrase.html",
                    controller: "ConfigurePassphraseController"
                }
            }
        });

        $stateProvider.state("app.developer", {
            url: "/settings/developer",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Developer.html",
                    controller: "DeveloperController"
                }
            }
        });

        $stateProvider.state("app.logs", {
            url: "/settings/logs",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Logs.html",
                    controller: "LogsController"
                }
            }
        });

        $stateProvider.state("app.log-entry", {
            url: "/settings/log-entry/:id",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/Log-Entry.html",
                    controller: "LogEntryController"
                }
            }
        });

        $stateProvider.state("app.about", {
            url: "/settings/about",
            views: {
                "menuContent": {
                    templateUrl: "templates/Settings/About.html",
                    controller: "AboutController"
                }
            }
        });

        //#endregion


        // If none of the above states are matched, use the empty route.
        $urlRouterProvider.otherwise("/app/blank");
    }

    //#endregion

    //#region Event Handlers

    /**
     * Fired when the OS decides to minimize or pause the application. This usually
     * occurs when the user presses the device's home button or switches applications.
     */
    function device_pause(Preferences: Services.Preferences): void {

        if (!isShowingSecurityPrompt) {
            // Store the current date/time. This will be used to determine if we need to
            // show the PIN lock screen the next time the application is resumed.
            Preferences.lastPausedAt = moment();
        }
    }

    /**
     * Fired when the OS restores an application to the foreground. This usually occurs
     * when the user launches an app that is already open or uses the OS task manager
     * to switch back to the application.
     */
    function device_resume($location: ng.ILocationService, $ionicViewService: any, Preferences: Services.Preferences, UiHelper: Services.UiHelper): void {

        isShowingSecurityPrompt = true;

        // Potentially display the PIN screen.
        UiHelper.showSecurityPromptAfterResume().then(() => {
            isShowingSecurityPrompt = false;

            // If the user is still at the blank sreen, then push them to their default view.
            if ($location.url() === "/app/blank") {

                // Tell Ionic to not animate and clear the history (hide the back button)
                // for the next view that we'll be navigating to below.
                $ionicViewService.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });

                // Navigate the user to their default view.
                $location.path(Preferences.defaultCategory.href.substring(1));
                $location.replace();
            }
        });
    }

    /**
     * Fired when the menu hard (or soft) key is pressed on the device (eg Android menu key).
     * This isn't used for iOS devices because they do not have a menu button key.
     */
    function device_menuButton($rootScope: ng.IScope): void {
        // Broadcast this event to all child scopes. This allows controllers for individual
        // views to handle this event and show a contextual menu etc.
        $rootScope.$broadcast("menubutton");
    }

    /**
     * Fired when Angular's route/location (eg URL hash) is changing.
     */
    function angular_locationChangeStart(event: ng.IAngularEvent, newRoute: string, oldRoute: string): void {
        console.log("Location change, old Route: " + oldRoute);
        console.log("Location change, new Route: " + newRoute);
    };

    /**
     * Fired when an unhandled JavaScript exception occurs outside of Angular.
     */
    function window_onerror(message: any, uri: string, lineNumber: number, columnNumber?: number): void {
        var Logger: Services.Logger,
            UiHelper: Services.UiHelper;

        console.error("Unhandled JS Exception", message, uri, lineNumber, columnNumber);

        try {
            UiHelper = angular.element(document.body).injector().get("UiHelper");
            UiHelper.toast.showLongBottom("An error has occurred; please try again.");
            UiHelper.progressIndicator.hide();
        }
        catch (ex) {
            console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
            alert("An error has occurred; please try again.");
        }

        try {
            Logger = angular.element(document.body).injector().get("Logger");
            Logger.logWindowError(message, uri, lineNumber, columnNumber);
        }
        catch (ex) {
            console.error("An error occurred while attempting to log an exception.", ex);
        }
    }

    /**
     * Fired when an exception occurs within Angular.
     * 
     * This includes uncaught exceptions in ng-click methods for example.
     */
    function angular_exceptionHandler(exception: Error, cause: string): void {
        var message = exception.message,
            Logger: Services.Logger,
            UiHelper: Services.UiHelper;

        if (!cause) {
            cause = "[Unknown]";
        }

        console.error("AngularJS Exception", exception, cause);

        try {
            UiHelper = angular.element(document.body).injector().get("UiHelper");
            UiHelper.toast.showLongBottom("An error has occurred; please try again.");
            UiHelper.progressIndicator.hide();
        }
        catch (ex) {
            console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
            alert("An error has occurred; please try again.");
        }

        try {
            Logger = angular.element(document.body).injector().get("Logger");
            Logger.logError("Angular exception caused by " + cause, exception);
        }
        catch (ex) {
            console.error("An error occurred while attempting to log an Angular exception.", ex);
        }
    }

    //#endregion
}
