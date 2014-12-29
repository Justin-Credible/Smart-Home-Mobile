module JustinCredible.SmartHomeMobile.Filters {

    /**
     * Used to convert a string to "title" case where-in each letter
     * that is proceeded by a space character or underscore (as well
     * as the first character) will be capitilized. If the fromCamelCase
     * flag is set to true the filter will assume the incoming string
     * does not have spaces, but uses capital letters as seperators
     * instead of spaces.
     * 
     * http://ng.malsup.com/#!/titlecase-filter
     */
    export class TitleCaseFilter {

        public static filter(s: string, fromCamelCase: boolean): string {
            s = (typeof(s) === "undefined" || s === null) ? "" : s;
            fromCamelCase = (typeof (fromCamelCase) === "undefined" || fromCamelCase === null) ? false : fromCamelCase;

            if (fromCamelCase) {
                // http://stackoverflow.com/questions/7225407/convert-camelcasetext-to-camel-case-text
                // http://jsfiddle.net/PeYYQ/
                return s.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
            }
            else {
                // First, convert an underscores to spaces (useful for constant or
                // enum-like strings where underscores are used instead of spaces.
                s = s.replace(/_/g, " ");

                return s.toString().toLowerCase().replace(/\b([a-z])/g, function (ch) {
                    return ch.toUpperCase();
                });
            }
        }
    }
}