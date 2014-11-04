module JustinCredible.SmartHomeMobile.Filters {

    /**
     * Used to convert a string to "title" case where-in each letter
     * that is proceeded by a space character (as well as the first
     * character) will be capitilized.
     * 
     * http://ng.malsup.com/#!/titlecase-filter
     */
    export class TitleCaseFilter {

        public static filter(s: string): string {
            s = (s === undefined || s === null) ? "" : s;

            // First, convert an underscores to spaces (useful for constant or
            // enum-like strings where underscores are used instead of spaces.
            s = s.replace(/_/g, " ");

            return s.toString().toLowerCase().replace(/\b([a-z])/g, function (ch) {
                return ch.toUpperCase();
            });
        }
    }
}