angular.module("todoApp")
    .controller("TodoListCtrl", ["pollService", "Todo", function(pollService, Todo) {
        console.log("TodoListCtrl","init");
    var self = this;
    self.todos = {
        value:pollService.getTodos()
    };
    self.state = {
        placeholderClassName: pollService.getPlaceholderClassName(),
        filterState: pollService.getFilter(),
        error: pollService.getError()
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
    self.updateDB = function(todo) {
        pollService.updateDB(todo);
    };
    pollService.tick("TodoListCtrl");
}]);
