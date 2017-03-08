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
