angular.module("todoApp").controller("navCtrl", ["pollService", "Todo", function(pollService, Todo) {
    console.log("navCtrl","init");
    var self = this;
    self.nav = {
        onGoing: {class: "active"},
        complete: {class: ""},
        all: {class: ""}
    };
    self.justDeleted = false;
    self.refresh = function() {
        Todo.query().$promise.then(function(data) {
        self.nav.all.size = data.length;
        self.nav.complete.size = data.filter((a) => a.isComplete).length;
        self.nav.onGoing.size = self.nav.all.size - self.nav.complete.size;
        console.log(data);
    })};
    self.getTab = function(tab) {
        var choices = {
            complete: {filterS: true, complete: "active", onGoing: "", all: ""},
            onGoing: {filterS: false, complete: "", onGoing: "active", all: ""},
            all: {filterS: "", complete: "", onGoing: "", all: "active"}
        };
        self.nav.complete.class = choices[tab].complete;
        self.nav.onGoing.class = choices[tab].onGoing;
        self.nav.all.class = choices[tab].all;
        pollService.setFilter(choices[tab].filterS);
        pollService.refresh();
    };
    pollService.setRefresh("navCtrl", self.refresh);
    self.refresh();
}]);
