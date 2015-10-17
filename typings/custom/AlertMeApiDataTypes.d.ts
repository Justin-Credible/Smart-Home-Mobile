/**
 * This module is used to house interfaces describing server-side data types
 * that are used on the client-side (eg as parameters or responses to/from
 * AJAX calls).
 */
declare module JustinCredible.SmartHomeMobile.AlertMeApiTypes {

    interface DeviceId {
        id: string;
    }

    interface DeviceDescriptor {
        type: string;
        name: string;
    }

    /**
     * Response for GET /login
     */
    interface LoginResult {
        hubIds: string[];
        hubNames: string[];
        ApiSession: string;
        userId: number;
        tandcConfirmed: boolean;
        userName: string;
        firstName: string;
        lastName: string;
        termsAndConditions: {
            latestVersion: number;
            latestAcceptedVersion: number;
            latestText: string;
            shouldShow: boolean;
        };
        userUtcOffset: number;
        isSecondary: boolean;
        primaryUsers: any[];
        primaryUsersDetails: any[];
    }

    /**
     * Response for GET /widgets/locks
     */
    interface LocksGetResult {
        locks: LockDevice[];
        atAGlance: {
            name: string;
            locked: number;
            unlocked: number;
            total: number
        };
        widgetStatus: string;
        widgetVisible: boolean;
    }

    /**
     * Response for PUT /widgets/locks/lockState
     */
    interface LockStatePutResult {
        timeout: number;
    }

    /**
     * Describes a device with locking capabilities (eg deadbolts).
     */
    interface LockDevice extends DeviceId, DeviceDescriptor {
        presence: boolean;
        lockState: string;
        canLock: boolean;
        canBuzzIn: boolean;
    }

    /**
     * Response for PUT /widgets/alarm/mode
     */
    interface AlarmModePutResult {
        state: string;
        grace: number;
    }

    /**
     * Response for GET /widgets/alarm
     */
    interface AlarmGetResult {
        status: {
            deviceName: string;
            deviceType: string;
            deviceName2: string;
            deviceType2: string;
            alarm: string;
            message: string;
            time: string;
        };
        behaviors: string[];
        targetBehavior: string;
        behavior: string;
        showSlider: boolean;
        showCancel: boolean;
        state: string;
        widgetStatus: string;
        widgetVisible: boolean;
    }

    /**
     * Response for GET /widgets/alarm/overview
     */
    interface AlarmOverviewGetResult {
        summary: {
            message: string;
            alarm: string;
            triggerTime: string;
            clearTime: string;
            deviceType: string;
            deviceName: string;
        };
        triggeredDevices: AlarmDevice[];
        otherDevices: { [id: string]: AlarmDevice };
    }

    /**
     * Describes a device that can trigger an alarm.
     */
    interface AlarmDevice extends DeviceDescriptor {
        alarm: string;
        presence: boolean;
        state: string;
        alarmTypes: string[];
    }

    /**
     * Response for GET /widgets/smartplugs
     */
    interface SmartPlugsGetResult {
        smartplugs: SmartPlugDevice[];
    }

    /**
     * Describes a device that controls power (eg light switches, electrical outlets, etc).
     */
    interface SmartPlugDevice extends DeviceId, DeviceDescriptor {
        controlType: string;
        plugType: string;
        presence: boolean;
        onOffState: string;
        lastKnownState: string;
        supportsIntensity: boolean;
        intensity: number;
        supportsSpeed: boolean;
        speed: string;
        applianceType: string;
        currency: string;
        costUnits: string;
        powerUnits: string;
        remoteMode: boolean;
        supportsPower: boolean;
        scheduleEnabled: boolean;
        supportsLock: boolean;
        isLocked: boolean;
        state: string; // API docs don't say what the type is, assuming string.
        bulb: boolean;
        lighting: boolean;
        howAmIDoing: number;
        costSoFarToday: any; // Number or string.
        costYesterday: any; // Number or string.
        costPredictedToday: any; // Number or string.
        powerNow: number;
        changeSummary: string;
        presenceYesterday: boolean;
        nextEvent: SmartPlugNextEvent;
    }

    /**
     * Describes the "next event" for a smart plug device.
     */
    interface SmartPlugNextEvent {
        action: string;
        timestamp: string;
    }

    /**
     * Response for GET /widgets/climate
     */
    interface ClimateGetResult {
        devices: { [deviceId: string]: string };
        deviceAvailable: boolean;
        deviceId: string;
        name: string;
        battery: string;
        mode: string;
        control: string;
        on: boolean;
        onOffState: string;
        isSchedule: boolean;
        presenceStatus: string;
        currentTemperature: number;
        targetTemperature: any; // Number or "--" string.
        shadowTemperature: any; // Number or "--" string.
        minTargetTemperature: number;
        maxTargetTemperature: number;
        confirmed: boolean;
        active: boolean;
        type: string;
        humidity: string;
        filter: {
            enabled: boolean;
            days: number;
            hours: number;
            date: number;
            usageTime: number;
            totalUsage: number;
            changeAt: number;
            state: string;
        };
        feature: boolean;
        hubAvailable: boolean;
        fanMode: string;
        formatting: {
            locale: string;
            temperatureUnit: string;
            currencyUnit: string;
            timezoneOffset: string;
        };
        outsideTemperature: number;
        temperatureRanges: {
            default: {
                min: number;
                max: number;
            }
        };
        availableFanModes: string[];
        exclScheduleFanModes: string[];
        scheduleFanMode: boolean;
        heatTargetTemperature: number;
        coolTargetTemperature: number;
        current: {
            temperature: number;
            time: string;
            fanMode: string;
            name: string;
            setpoint: number;
            start: number
        };
        next: {
            temperature: number;
            time: string;
            fanMode: string;
            name: string;
            setpoint: number;
            start: number;
            endTime: string;
        };
        thermostatType: string;
        modes: {
            cool: string;
            heat: string;
            climate: string
        };
        controls: {
            schedule: string;
            manual: string;
            presence: string
        };
        messageIcon: string;
        message: string;
        widgetStatus: string;
        widgetVisible: boolean;
    }

    /**
     * Response for PUT /widgets/climate/mode
     */
    interface ClimateModePutResult {
        mode: string;
        confirmed: boolean;
        validModes: string[];
    }

    /**
     * Response for GET /widgets/homeStatus
     */
    interface HomeStatusGetResult {
        hub: HomeStatusHub;
        devices: { [deviceId: string]: HomeStatusDevice };
        widgetStatus: string;
        widgetVisible: boolean;
    }

    interface HomeStatusHub {
        available: boolean;
        availableStatus: string;
        upgrading: boolean;
        configured: boolean;
        hubOs: string;
        version: string;
        latestVersion: string;
        upgrade: string;
        powerType: string;
        connectionType: string;
        onSince: number;
        upTime: number;
        timezone: number;
        timezoneName: string;
        dateInstallDone: number;
        daylightSaving: string;
        behaviourId: number;
        behaviourType: string;
        model: string;
        ip: string;
        externalIp: string;
        simPresent: boolean;
        gprsSignalStrength: number;
        currentImei: string;
        currentIccid: string;
        currentSimId: string;
        hardwareRevision: string;
        battery: string;
        zigbeeNetworkInfo: string;
        macAddress: string;
        zwaveRole: string;
        rerouteZwaveNetworkStatus: string;
        name: string;
        status: string;
        simHistory: HomeStatusSimHistory[];
    }

    /**
     * Describes a single SIM history entry in the homeStatus response.
     */
    interface HomeStatusSimHistory {
        state: string;
        start_date: string;
        simiccid: string;
        imei: string;
        provider: string;
    }

    /**
     * Describes a single device in the homeStatus response.
     */
    interface HomeStatusDevice extends DeviceId, DeviceDescriptor {
        protocol: string[];
        battery: number;
        batteryLow: boolean;
        lowSignal: boolean;
        batteryLevel: number;
        batteryPercentage: number;
        mains: boolean;
        power: boolean;
        signal: number;
        presence: boolean;
        temperature: number;
        version: string;
        latestVersion: string;
        latestRequiredVersion?: string;
        upgradeStatus: string;
        isGeneric: boolean;
        hasBattery: boolean;
        state: string;
        standalone: boolean;
        upgrade: string;
        reason?: string;
        hardwareRevision: string;
        repeaterVersion?: number;
        missingProtocols?: { [id: string]: string };
    }
}
