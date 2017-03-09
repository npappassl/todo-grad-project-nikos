angular.module("todoApp").service("pollService",
    ["$timeout", "Todo", function(timeout, Todo) {
        console.log("pollService init")
        var self = this;
        self.stateId = -1;

        self.tick = function(refresh) {
            Todo.get({id: "state"}).$promise.then(function(data) {
                if (data.state !== self.stateId) {
                    self.stateId = data.state;
                    refresh();
                    console.log("has to refressh");
                }
            }).catch(function(err) {
                console.log(err, "offline");
            });
            timeout(function() {
                self.tick(refresh);
            } , 1000);
        };
}]);
