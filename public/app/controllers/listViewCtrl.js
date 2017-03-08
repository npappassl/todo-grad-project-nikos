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
        error: {
            text:""
        }
    };

    self.editedTodo = null;
    // Update
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
    self.refresh = function() {
        console.log("refreshList");
        self.state.filterState = pollService.getFilter().filter;
        Todo.query(function(data) {
            self.todos = data;
        }).$promise.then(function(data) {
            self.state.placeholderClassName = "hidden";
        }).catch(function(error) {
            pollService.handleError(error, "get list");
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
    pollService.setRefresh("TodoListCtrl", self.refresh);
    pollService.setError(self.state);
    self.refresh();
    pollService.tick("TodoListCtrl");
}]);
