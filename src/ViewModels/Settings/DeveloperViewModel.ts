module JustinCredible.SmartHomeMobile.ViewModels {

    export class DeveloperViewModel {
        mockApiRequests: boolean;

        devicePlatform: string;
        deviceModel: string;
        deviceOsVersion: string;
        deviceUuid: string;
        deviceCordovaVersion: string;

        defaultStoragePathId: string;
        defaultStoragePath: string;
    }
}
