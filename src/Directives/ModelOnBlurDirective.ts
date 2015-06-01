module JustinCredible.SmartHomeMobile.Directives {

    /**
     * A directive for deferring Angular's ng-change directive to the blur event.
     * 
     * http://stackoverflow.com/questions/11868393/angularjs-inputtext-ngchange-fires-while-the-value-is-changing
     */
    export class ModelOnBlurDirective implements ng.IDirective {

        public restrict = "A";
        public require = "ngModel";
        public priority = 100;

        public link(scope: ng.IScope, element: ng.IAugmentedJQuery, attributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction): void {

            //if (attributes.type === "radio" || attributes.type === "checkbox") {
            //    return;
            //}

            element.unbind("input").unbind("keydown").unbind("change");

            element.bind("blur", function () {
                scope.$apply(function () {
                    controller.$setViewValue(element.val());
                });
            });
        }
    }
}
