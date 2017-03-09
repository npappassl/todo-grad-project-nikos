angular.module("todoApp").directive("nipaDelBut", ["interService", "Todo", function(interService, Todo) {
    return {
        restrict: "E",
        scope: {
            todo: "=",
            index: "=",
            display: "="
        },
        transclude:false,
        template: "<button id=del{{index}} class=\"delButton\">{{dis}}</button>",
        link: function($scope, element, attrs, todo){
            element.id="del"+$scope.$index;
            console.log($scope.display);
            $scope.dis = $scope.display;
            element.on("click", function() {
                console.log("clicked", todo, $scope);
                Todo.delete({id: $scope.todo.id}).$promise.then(function(data){
                    console.log("deleted", data);
                    interService.refresh();
                    interService.showUndoSpan();
                }).catch(function(err){
                    interService.handleError(err, "delete item(s)");
                });
            });
        },
        controller: function() {
            console.log("nipaDelBut");
        }
    }
}]);
