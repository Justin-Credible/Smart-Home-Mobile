module JustinCredible.SmartHomeMobile.ViewModels {

    export class ThermostatViewModel {
        public isRefreshing: boolean;
        public lastUpdated: Date;
        public climate: AlertMeApiTypes.ClimateGetResult;

        public newTargetTemperature: number;
        public temperatureSliderValue: string;
        public newOnOffState: string;
        public newMode: string;
        public changesMade: boolean;
    }

}