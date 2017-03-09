angular.module("todoApp").service("pollService",
    ["interService", "$timeout", "Todo", function(interService, timeout, Todo) {
        var self = this;
        self.stateId = -1;

        self.tick = function() {
            Todo.get({id: "state"}).$promise.then(function(data) {
                if (data.state !== self.stateId) {
                    self.stateId = data.state;
                    interService.refresh();
                }
            }).catch(function(err) {
                console.log(err, "offline");
            });
            timeout(function() {
                self.tick();
            } , 1000);
        };
        self.tick();
}]);
