
/**
 * A common location for application-wide constant values.
 */
module JustinCredible.SmartHomeMobile.Constants {

    /**
     * Value for rejection of a promise when opening a dialog using the showDialog
     * helper method. This value will be used when showDialog was called with a dialog
     * ID of a dialog that is already open.
     */
    export const DIALOG_ALREADY_OPEN = "DIALOG_ALREADY_OPEN";

    /**
     * Value for rejection of a promise when opening a dialog using the showDialog
     * helper method. This value will be used when showDialog was called with a dialog
     * ID who is not registered in the dialogTemplateMap map.
     */
    export const DIALOG_ID_NOT_REGISTERED = "DIALOG_ID_NOT_REGISTERED";
}

/**
 * A collection of titles for buttons commonly used with dialogs.
 */
module JustinCredible.SmartHomeMobile.Constants.Buttons {
    export const Yes = "Yes";
    export const No = "No";
    export const OK = "OK";
    export const Cancel = "Cancel";
}

/**
 * A collection of names of events used within the application.
 */
module JustinCredible.SmartHomeMobile.Constants.Events {
    export const HTTP_ERROR = "http.error";
    export const HTTP_BLOCKING_REQUEST_STARTED = "http.blocking-request-started";
    export const HTTP_BLOCKING_REQUESTS_COMPLETED = "http.blocking-requests-completed";
    export const HTTP_NON_BLOCKING_REQUEST_STARTED = "http.non-blocking-request-started";
    export const HTTP_NON_BLOCKING_REQUESTS_COMPLETED = "http.non-blocking-requests-completed";
    export const APP_MENU_BUTTON = "app.menuButton";
    export const SCROLL_REFRESH_COMPLETE = "scroll.refreshComplete";
}

module JustinCredible.SmartHomeMobile.Constants.Dashboard {
    export const ITEM_WIDTH = 40;
    export const ITEM_DEFAULT_HORIZONTAL_SPACING = 55;
    export const ITEM_DEFAULT_VERTICAL_SPACING = 60
    export const ITEM_DEFAULT_HORIZONTAL_START = 10;
    export const ITEM_DEFAULT_VERTICAL_START = 65;
}