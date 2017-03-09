angular.module("todoApp").controller("undoCtrl", ["interService", "Todo", function(interService, Todo){
    console.log("undoCtrl","init");
    var self = this;
    self.justDeleted = {
        value:false
    };
    interService.setUndo(self.justDeleted);
    self.hideUndoSpan = function() {
        interService.hideUndoSpan();
        interService.refresh();
    };

    self.undoDelete = function() {
        interService.hideUndoSpan();
        Todo.update({id: "undo"}, function(data) {
            interService.refresh();
        }).$promise.catch(function(err) {
            interService.handleError(err, "undo");
        });
    };

}]);
