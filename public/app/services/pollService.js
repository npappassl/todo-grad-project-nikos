angular.module("todoApp").service("pollService", ["$timeout", "Todo", function(timeout, Todo) {
    var self = this;
    self.stateId = -1;

    self.tick = function(handleError, refresh, attribute, retobject) {
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
            handleError(err, "offline");
        });
        timeout(function() {
            self.tick(error, refresh, attribute, retobject);
        } , 1000);
    };
    self.setFilter = function(filter) {
        self.filterState = filter;
    };
    self.increment = function() {
        self.stateId++;
    };
}]);
