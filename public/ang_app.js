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
    this.cachedTodos;
    this.nav = {
        onGoing: "active",
        complete: "",
        all: ""
    };
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
    this.deleteTodo = function($event) {
        var targetId = $event.target.id.substring(3);
        Todo.delete({id: targetId});
        this.cachedTodos = Todo.query();
        this.todos = Todo.query();
    };
    this.doneTodo = function($event) {
        var targetId = $event.target.id.substring(5);
        Todo.update({id: targetId}, {isComplete: true});
        this.cachedTodos = Todo.query();
        this.todos = Todo.query();
    };
    this.getComplete = function() {
        var temp = this.cachedTodos || this.todos;
        this.cachedTodos = Todo.query();
        this.todos = temp.filter(function(a) {
            return a.isComplete;
        });
        this.nav.complete = "active";
        this.nav.onGoing = "";
        this.nav.all = "";
    };
    this.getOngoing = function() {
        var temp = this.cachedTodos || this.todos;
        this.cachedTodos = Todo.query();
        this.todos = temp.filter(function(a) {
            return (!a.isComplete);
        });
        this.nav.complete = "";
        this.nav.onGoing = "active";
        this.nav.all = "";
    };
    this.getAll = function() {
        this.todos = Todo.query();
        this.nav.complete = "";
        this.nav.onGoing = "";
        this.nav.all = "active";
    };
    // update todo
    this.updateTodo = function (todo) {
        this.editedTodo = todo;
        // Clone the original todo to restore it on demand.
        this.originalTodo = angular.extend({}, todo);
    };
});
