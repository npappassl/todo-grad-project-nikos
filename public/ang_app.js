var app_ang = angular.module("todoApp", ["ngResource", "ngRoute"]);
app_ang.config(function($routeProvider) {
    $routeProvider.when("/", {
        controller: "TodoListCtrl as list",
        templateUrl: "TodoList.html"
    });
});
app_ang.factory("Todo", function($resource) {
    var TodoObject = $resource("/api/todo/:id", {id: "@id"}, {
        "update": {method: "PUT"}
    });
    return TodoObject;
});
app_ang.controller("TodoListCtrl", function(Todo) {
    this.todos = Todo.query();
    this.filterState = false;
    this.nav = {
        onGoing: "active",
        complete: "",
        all: ""
    };
    this.editedTodo = null;
    this.newTodoField = "";
    this.addTodo = function () {
        var newTodo = {
            title: this.newTodoField.trim(),
            isComplete: false
        };
        if (!newTodo.title) {
            return;
        }
        Todo.save(newTodo);
        this.newTodoField = "";
        this.todos = Todo.query();
    };
    this.deleteTodo = function(todo) {
        Todo.delete({id: todo.id});
        this.cachedTodos = Todo.query();
        this.todos = Todo.query();
    };
    this.doneTodo = function(todo) {
        Todo.update({id: todo.id}, {isComplete: true});
        this.cachedTodos = Todo.query();
        this.todos = Todo.query();
    };
    this.getComplete = function() {
        this.filterState = true;
        this.nav.complete = "active";
        this.nav.onGoing = "";
        this.nav.all = "";
    };
    this.getOngoing = function() {
        this.filterState = false;
        this.nav.complete = "";
        this.nav.onGoing = "active";
        this.nav.all = "";
    };
    this.getAll = function() {
        this.filterState = "";
        this.nav.complete = "";
        this.nav.onGoing = "";
        this.nav.all = "active";
    };
    // editing todo
    this.updateTodo = function (todo) {
        this.editedTodo = todo;
        this.originalTodo = angular.extend({}, todo);
    };
    this.updateDB = function (todo) {
        Todo.update({id: todo.id}, {title: todo.title});
        this.todos = Todo.query();
    };

});
