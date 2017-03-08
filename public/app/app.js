var app_ang = angular.module("todoApp", ["ngResource", "ngRoute", "ngAnimate"]);
angular.module("todoApp").run(function() {
    console.log("app is runing");
});
angular.module("todoApp").config(["$routeProvider", function($routeProvider) {
    $routeProvider.when("/", {
        controller: "mainCtrl as main",
        templateUrl: "TodoList.html"
    }).otherwise({
        redirectTo: "/"
    });
}]);
angular.module("todoApp").directive("nipaDelBut", ["Todo", function(Todo) {
    return {
        restrict: "A",
        scope:{
            todo: "="
        },
        template:"<button class=\"delButton\" id=\"del{{$index}}\" ng-click=\"deleteTodo(todo)\">x</button>",
        controller: function() {
            this.deleteTodo = funciton(todo){
                Todo.delete({id: todo.id || "complete"}).$promise
                    .then(function(data) {
                        self.state.justDeleted = true;
                        self.refresh();
                    }).catch(function(err) {
                        self.handleError(err, "delete item(s)");
                    });
            };
        }
    }
}]);
