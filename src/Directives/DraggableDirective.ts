module JustinCredible.SmartHomeMobile.Directives {

    /**
     * A directive for adding drag and drop capability to an element.
     * 
     * This was taken from the Angular directive sample:
     * https://docs.angularjs.org/guide/directive
     */
    export class DraggableDirective implements ng.IDirective {

        //#region Injection

        public static ID = "draggable";

        public static get $inject(): string[] {
            return ["$document"];
        }

        constructor(
            private $document: ng.IDocumentService) {

            // Ensure that the link function is bound to this instance so we can
            // access instance variables like $parse. AngularJs normally executes
            // the link function in the context of the global scope.
            this.link = _.bind(this.link, this);
        }

        //#endregion

        public restrict = "A";

        public link(scope: ng.IScope, element: ng.IAugmentedJQuery, attributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction): void {

            var startX = 0, startY = 0, x = 0, y = 0;

            element.css({
                position: 'relative',
                border: '1px solid red',
                backgroundColor: 'lightgrey',
                cursor: 'pointer'
            });

            element.on('mousedown', (event) => {
                // Prevent default dragging of selected content
                event.preventDefault();
                startX = event.pageX - x;
                startY = event.pageY - y;
                this.$document.on('mousemove', mousemove);
                this.$document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;
                element.css({
                    top: y + 'px',
                    left:  x + 'px'
                });
            }

            var mouseup = () => {
                this.$document.off('mousemove', mousemove);
                this.$document.off('mouseup', mouseup);
            }
        }
    }
}
