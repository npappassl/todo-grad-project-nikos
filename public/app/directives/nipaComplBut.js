angular.module("todoApp").directive("nipaComplBut", ["interService", "Todo", function(interService, Todo) {
    return {
        restrict: "E",
        scope: {
            todo: "=",
            index: "="
        },
        template: "<button id=compl{{index}} class=\"complButton\">✓</button>",
        link: function($scope, element, attrs, todo){
            element.on("click", function() {
                Todo.update({id: $scope.todo.id},{isComplete: true}).$promise.then(function(data){
                    interService.refresh();
                }).catch(function(err){
                    interService.handleError(err, "update item");
                });
            });
        },
        controller: function() {
            console.log("nipaUpdateBut");
        }
    }
}]);
