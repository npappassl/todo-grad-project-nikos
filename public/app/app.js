var app_ang = angular.module("todoApp", ["ngResource", "ngRoute", "ngAnimate"]);
app_ang.run(function() {
    console.log("app is runing");
});
app_ang.config(function($routeProvider) {
    $routeProvider.when("/", {
        controller: "TodoListCtrl as list",
        templateUrl: "TodoList.html"
    }).otherwise({
        redirectTo: "/"
    });
});
