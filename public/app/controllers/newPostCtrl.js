angular.module("todoApp").controller("newPostCtrl", ["Todo", function(Todo) {
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
            self.refresh();
        }).catch(function(error) {
            self.handleError(error, "create item");
        });
    };

}]);
