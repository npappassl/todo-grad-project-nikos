angular.module("todoApp").service("pollService", ["$timeout", "Todo", function(timeout, Todo) {
    var self = this;
    self.stateId = -1;
    self.refreshes = {};
    self.filterState = false;
    self.errorDiv;
    self.handleError = function(error, failedAction) {
        if (error) {
            self.errorDiv = "Failed to " + failedAction + ". Server returned " +
                error.status + " - " + error.statusText;
        }
    };

    self.tick = function(refresh, attribute, retobject) {
        Todo.get({id: "state"}).$promise.then(function(data) {
            if (data.state !== self.stateId) {
                self.stateId = data.state;
                if(attribute){
                    retobject[attribute] = self[attribute];
                }
                refresh();
            }
            if (error === "offline...") {
                error = "";
            }
        }).catch(function(err) {
            self.handleError(err, "offline");
        });
        timeout(function() {
            self.tick(error, refresh);
        } , 1000);
    };
    self.setError = function(err) {
        self.errorDiv = err;
    };
    self.setFilter = function(filter) {
        self.filterState = filter;
    };
    self.getFilter = function() {
        return {filter: self.filterState};
    };
    self.setRefresh = function(name, func){
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
    self.increment = function() {
        self.stateId++;
    };
}]);
