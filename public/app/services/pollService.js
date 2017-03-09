angular.module("todoApp").service("pollService", ["$timeout", "Todo", function(timeout, Todo) {
    console.log("pollService","init");
    var self = this;
    self.stateId = -1;
    self.refreshes = {};
    self.filterState = {
        value:false
    };
    self.justDeleted = {
        value:false
    };
    self.errorDiv = {
        text: ""
    };
    self.handleError = function(error, failedAction) {
        if (error) {
            self.errorDiv.text = "Failed to " + failedAction + ". Server returned " +
                error.status + " - " + error.statusText;
        }
        self.refresh("TodoListCtrl");
    };

    self.tick = function(refresh) {
        Todo.get({id: "state"}).$promise.then(function(data) {
            if (data.state !== self.stateId) {
                self.stateId = data.state;
                self.refresh();
            }
        }).catch(function(err) {
            console.log(err, "offline");
        });
        timeout(function() {
            self.tick(error, refresh);
        } , 1000);
    };
    self.setUndo = function(justDeleted) {
        self.justDeleted = justDeleted;
    }
    self.showUndoSpan = function() {
        self.justDeleted.value = true;
    };
    self.hideUndoSpan = function() {
        self.justDeleted.value = false;
    };
    self.getError = function() {
        return self.errorDiv;
    };
    self.getFilter = function() {
        return self.filterState;
    };
    self.setRefresh = function(name, func) {
        self.refreshes[name] = function() {
            func();
        }
    };
    self.refresh = function(name){
        console.log("name",name);
        if (name){
            self.refreshes[name]();
        } else {
            self.refreshes["navCtrl"]();
            self.refreshes["TodoListCtrl"]();
        }
    }
}]);
