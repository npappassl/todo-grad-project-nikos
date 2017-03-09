angular.module("todoApp").controller("undoCtrl", ["pollService", "Todo", function(pollService, Todo){
    console.log("undoCtrl","init");
    var self = this;
    self.justDeleted = {
        value:false
    };
    pollService.setUndo(self.justDeleted);
    self.hideUndoSpan = function() {
        pollService.hideUndoSpan();
        pollService.refresh();
    };

    self.undoDelete = function() {
        pollService.hideUndoSpan();
        Todo.update({id: "undo"}, function(data) {
            pollService.refresh();
        }).$promise.catch(function(err) {
            pollService.handleError(err, "undo");
        });
    };

}]);
