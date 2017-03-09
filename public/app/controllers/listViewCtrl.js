angular.module("todoApp")
    .controller("TodoListCtrl", ["interService", "Todo", function(interService, Todo) {
        console.log("TodoListCtrl","init");
    var self = this;
    self.todos = {
        value:interService.getTodos()
    };
    self.state = {
        placeholderClassName: interService.getPlaceholderClassName(),
        filterState: interService.getFilter(),
        error: interService.getError()
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
        interService.updateDB(todo);
    };
}]);
