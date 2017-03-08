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
            ind: "="
        },
        template:"<button class=\"delButton\" id=\"del{{$index}}\" ng-click=\"list.deleteTodo(todo)\">x</button>",
        controller: function(){
            alert("dasda");
        }
    }
}]);
