module JustinCredible.SmartHomeMobile {

    /**
     * Used to define all of the client-side routes for the application.
     * This maps routes to the controller/view that should be used.
     */
    export class RouteConfig {

        public static setupRoutes($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider): void {

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


            // If none of the above states are matched, use the blank route.
            $urlRouterProvider.otherwise("/app/blank");
        }
    }
}
