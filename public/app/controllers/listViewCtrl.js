angular.module("todoApp")
    .controller("TodoListCtrl", ["pollService", "Todo", function(pollService, Todo) {
    var self = this;
    self.nav = {
        onGoing: {class: "active"},
        complete: {class: ""},
        all: {class: ""}
    };
    self.state = {
        placeholderClassName: "",
        justDeleted: false,
        filterState: false,
        error: ""
    };
    self.editedTodo = null;
    // Delete
    self.deleteTodo = function(todo) {
        Todo.delete({id: todo.id || "complete"}).$promise
            .then(function(data) {
                self.state.justDeleted = true;
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
            self.state.error = "Failed to " + failedAction + ". Server returned " +
                error.status + " - " + error.statusText;
        }
    };
    self.refreshCounts = function() {
        self.nav.all.size = self.todos.length;
        self.nav.complete.size = self.todos.filter(function(todo) {
            return todo.isComplete;
        }).length;
        self.nav.onGoing.size = self.nav.all.size - self.nav.complete.size;
    };
    self.refresh = function() {
        console.log("refreshList");
        Todo.query(function(data) {
            self.todos = data;
            self.refreshCounts();

        }).$promise.then(function(data) {
            self.state.placeholderClassName = "hidden";
        }).catch(function(error) {
            self.handleError(error, "get list");
        });
    };
    self.hideUndoSpan = function() {
        self.state.justDeleted = false;
    };
    self.undoDelete = function() {
        Todo.update({id: "undo"}, function() {
            self.hideUndoSpan();
            self.refresh();
        });
    };

    self.refresh();
    self.on
    pollService.tick(self.handleError,self.refresh, "filterState", self.state);
}]);
