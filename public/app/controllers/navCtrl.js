angular.module("todoApp").controller("navCtrl", ["interService", function(interService) {
    console.log("navCtrl","init");
    var self = this;
    self.todos = {
        value:interService.getTodos()
    };

    self.nav = {
        onGoing: {class: "active"},
        complete: {class: ""},
        all: {class: ""}
    };

    self.refresh = function() {
        self.nav.all.size = self.todos.value.length;
        self.nav.complete.size = self.todos.value.filter(function(a) {return a.isComplete;}).length;
        self.nav.onGoing.size = self.nav.all.size - self.nav.complete.size;
    };
    self.getTab = function(tab) {
        var choices = {
            complete: {filterS: true, complete: "active", onGoing: "", all: ""},
            onGoing: {filterS: false, complete: "", onGoing: "active", all: ""},
            all: {filterS: "", complete: "", onGoing: "", all: "active"}
        };
        self.nav.complete.class = choices[tab].complete;
        self.nav.onGoing.class = choices[tab].onGoing;
        self.nav.all.class = choices[tab].all;
        self.filterState.value = choices[tab].filterS;
        // interService.refresh();
    };
    self.filterState = interService.getFilter();
    self.refresh();
    interService.setRefresh("navCtrl", self.refresh);
}]);
