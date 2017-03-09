angular.module("todoApp").directive("nipaDelBut", ["pollService", "Todo", function(pollService, Todo) {
    return {
        restrict: "E",
        scope: {
            todo: "=",
            index: "="
        },
        transclude:false,
        template: "<button id=del{{index}} class=\"delButton\">x</button>",
        link: function($scope, element, attrs, todo){
            element.id="del"+$scope.$index;
            element.on("click", function() {
                console.log("clicked", todo, $scope);
                Todo.delete({id: $scope.todo.id}).$promise.then(function(data){
                    console.log("deleted", data);
                    pollService.refresh();
                    pollService.showUndoSpan();
                }).catch(function(err){
                    pollService.handleError(err, "delete item(s)");
                });
            });
        },
        controller: function() {
            console.log("nipaDelBut");
        }
    }
}]);
