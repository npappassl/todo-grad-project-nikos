var app_ang = angular.module("todoApp");

app_ang.controller("TodoListCtrl", ["$timeout", "Todo", function(timeout, Todo) {
    var self = this;
    self.placeholderClassName = "";
    self.justDeleted = false;
    self.filterState = false;
    self.nav = {
        onGoing: {class: "active"},
        complete: {class: ""},
        all: {class: ""}
    };
    self.state = -1;
    self.error = "";
    self.editedTodo = null;
    self.newTodoField = "";
    // new todo
    self.addTodo = function () {
        var newTodo = {
            title: self.newTodoField.trim(),
            isComplete: false
        };
        if (!newTodo.title) {
            return;
        }
        Todo.save(newTodo).$promise.then(function(data) {
            self.newTodoField = "";
            self.refresh();
        }).catch(function(error) {
            self.handleError(error, "create item");
        });
    };
    // Delete
    self.deleteTodo = function(todo) {
        Todo.delete({id: todo.id}).$promise
            .then(function(data) {
                self.justDeleted = true;
                self.refresh();
            }).catch(function(err) {
                self.handleError(err, "delete item(s)");
            });
    };
    self.deleteComplete = function() {
        Todo.delete({id: "complete"}).$promise
            .then(function(data) {
                self.justDeleted = true;
                self.refresh();
            }).catch(function(err) {
                self.handleError(err, "delete item(s)");
            });
    };
    // Update
    self.doneTodo = function(todo) {
        Todo.update({id: todo.id}, {isComplete: true});
        self.refresh();
    };
    self.updateTodo = function ($event, todo) {
        self.editedTodo = todo;
        self.originalTodo = angular.extend({}, todo);
        setTimeout(function() {
            $event.target.parentNode.getElementsByClassName("edit")[0].focus();
        }, 200);
    };
    // Aux
    self.updateDB = function (todo) {
        Todo.update({id: todo.id}, {title: todo.title});
        self.refresh();
    };
    self.handleError = function(error, failedAction) {
        if (error) {
            self.error = "Failed to " + failedAction + ". Server returned " + error.status + " - " + error.statusText;
        }
    };
    self.getTab = function(tab) {
        var choices = {
            complete: {filterS: true, complete: "active", onGoing: "", all: ""},
            onGoing: {filterS: false, complete: "", onGoing: "active", all: ""},
            all: {filterS: "", complete: "", onGoing: "", all: "active"}
        };
        self.filterState = choices[tab].filterS;
        self.nav.complete.class = choices[tab].complete;
        self.nav.onGoing.class = choices[tab].onGoing;
        self.nav.all.class = choices[tab].all;
    };
    self.refreshCounts = function() {
        self.nav.all.size = self.todos.length;
        self.nav.complete.size = self.todos.filter(function(todo) {
            return todo.isComplete;
        }).length;
        self.nav.onGoing.size = self.nav.all.size - self.nav.complete.size;
    };
    self.refresh = function() {
        Todo.query(function(data) {
            self.todos = data;
            self.refreshCounts();

        }).$promise.then(function(data) {
            self.placeholderClassName = "hidden";
        }).catch(function(error) {
            self.handleError(error, "get list");
        });
    };
    self.hideUndoSpan = function() {
        self.justDeleted = false;
    };
    self.undoDelete = function() {
        Todo.update({id: "undo"}, function() {
            self.hideUndoSpan();
            self.refresh();
        });
    };
    self.refresh();
    (function tick() {
        Todo.get({id: "state"}).$promise.then(function(data) {
            if (data.state !== self.state) {
                self.state = data.state;
                self.refresh();
            }
            if (self.error === "offline...") {
                self.error = "";
            }
        }).catch(function(err) {
            self.error = "offline...";
        });
        timeout(tick, 1000);
    })();
}]);
