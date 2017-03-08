angular.module("todoApp").controller("newPostCtrl", ["pollService", "Todo", function(pollService, Todo) {
    var self = this;
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
            pollService.refresh();
        }).catch(function(error) {
            pollService.handleError(error, "create item");
        });
    };

}]);
