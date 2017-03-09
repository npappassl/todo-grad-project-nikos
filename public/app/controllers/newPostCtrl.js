angular.module("todoApp").controller("newPostCtrl", ["interService", "Todo", function(interService, Todo) {
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
            interService.refresh();
        }).catch(function(error) {
            interService.handleError(error, "create item");
        });
    };

}]);
