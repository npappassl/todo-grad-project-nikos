angular.module("todoApp").directive("nipaComplBut", ["pollService", "Todo", function(pollService, Todo) {
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
                    pollService.refresh();
                }).catch(function(err){
                    pollService.handleError(err, "update item");
                });
            });
        },
        controller: function() {
            console.log("nipaUpdateBut");
        }
    }
}]);
