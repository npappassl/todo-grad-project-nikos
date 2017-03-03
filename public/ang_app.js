var app_ang = angular.module("todoApp", ["ngResource", "ngRoute", "ngAnimate"]);
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
app_ang.controller("TodoListCtrl", ["$timeout", "Todo", function(timeout, Todo) {
    var self = this;
    self.placeholderClassName = "";
    self.filterState = false;
    self.nav = {
        onGoing: "active",
        complete: "",
        all: ""
    };
    self.state = 0;
    self.error = "";
    self.editedTodo = null;
    self.newTodoField = "";
    self.addTodo = function () {
        var newTodo = {
            title: self.newTodoField.trim(),
            isComplete: false
        };
        if (!newTodo.title) {
            return;
        }
        Todo.save(newTodo).$promise.then(function(data) {
            console.log(data);
            self.newTodoField = "";
            self.refresh();
        }).catch(function(error) {
            self.handleError(error, "create item");
        });
    };
    self.deleteTodo = function(todo) {
        Todo.delete({id: todo.id}).$promise
            .then(function(data) {
                self.refresh();
            }).catch(function(err) {
                self.error = "Failed to delete item(s). Server returned " + err.status + " - " + err.statusText;
            });
    };
    self.doneTodo = function(todo) {
        Todo.update({id: todo.id}, {isComplete: true});
        self.refresh();
    };
    self.getComplete = function() {
        self.filterState = true;
        self.nav.complete = "active";
        self.nav.onGoing = "";
        self.nav.all = "";
    };
    self.getOngoing = function() {
        self.filterState = false;
        self.nav.complete = "";
        self.nav.onGoing = "active";
        self.nav.all = "";
    };
    self.getAll = function() {
        self.filterState = "";
        self.nav.complete = "";
        self.nav.onGoing = "";
        self.nav.all = "active";
    };
    // editing todo
    self.updateTodo = function ($event, todo) {
        self.editedTodo = todo;
        self.originalTodo = angular.extend({}, todo);
        setTimeout(function() {
            $event.target.parentNode.getElementsByClassName("edit")[0].focus();
        }, 200);
    };
    self.updateDB = function (todo) {
        Todo.update({id: todo.id}, {title: todo.title});
        self.refresh();
    };
    self.deleteComplete = function() {
        Todo.delete({id: "complete"}).$promise
            .then(function(data) {
                self.refresh();
            }).catch(function(err) {
                self.error = err;
            });
    };
    self.handleError = function(error, failedAction) {
        if (error) {
            self.error = "Failed to " + failedAction + ". Server returned " + error.status + " - " + error.statusText;
        }
    };
    self.refresh = function() {
        Todo.query(function(data) {
            self.todos = data;
        }).$promise.then(function(data) {
            self.placeholderClassName = "hidden";
        }).catch(function(error) {
            self.handleError(error, "get list");
        });
    };
    self.refresh();
    (function tick() {
        Todo.get({id: "state"}, function(data) {
            if (data.state > self.state) {
                self.state = data.state;
                self.refresh();
            }
        });
        timeout(tick, 1000);
    })();
}]);
