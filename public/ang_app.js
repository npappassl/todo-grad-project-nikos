var app_ang = angular.module("todoApp", ["ngResource", "ngRoute"]);
app_ang.config(function($routeProvider){
    $routeProvider.when("/",{
        controller: "TodoListCtrl as list",
        templateUrl: "TodoList.html"});
});
app_ang.factory("Todo", function($resource){
    return $resource("/api/todo/:id", {id: "@id"});
});
app_ang.controller("TodoListCtrl", function(Todo){
        this.todos = Todo.query();
});
