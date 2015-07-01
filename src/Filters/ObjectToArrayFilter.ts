module JustinCredible.SmartHomeMobile.Filters {

    /**
     * Used to convert an object into an array; useful for using with ng-repeat
     * directive and a view model object that is an object instead of an array.
     * 
     * <select ng-options="... in bidTypes | ObjectToArray | filter:{id:'!2'}">
     * 
     * http://stackoverflow.com/a/23703627
     */
    export class ObjectToArrayFilter {

        public static ID = "ObjectToArray";

        public static filter(obj: any): any[] {

            var array = [];

            angular.forEach(obj, function (element: any) {
                array.push(element);
            });

            return array;
        }
    }
}
