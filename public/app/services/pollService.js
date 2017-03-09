angular.module("todoApp").service("pollService", ["$timeout", "Todo", function(timeout, Todo) {
    console.log("pollService","init");
    var self = this;
    self.stateId = -1;
    self.refreshes = {};
    self.filterState = {
        value:false
    };
    self.todos = [];
    self.justDeleted = {
        value:false
    };
    self.placeholderClassName = {
        value:""
    };
    self.errorDiv = {
        text: ""
    };
    self.handleError = function(error, failedAction) {
        if (error) {
            self.errorDiv.text = "Failed to " + failedAction + ". Server returned " +
                error.status + " - " + error.statusText;
        }
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
    self.getTodos = function(){
        return self.todos;
    };
    self.getPlaceholderClassName = function() {
        return self.placeholderClassName;
    }
    self.setRefresh = function(name, func) {
        self.refreshes[name] = function() {
            func();
        }
    };
    // Aux
    self.updateDB = function (todo) {
        Todo.update({id: todo.id}, {title: todo.title});
        self.refresh();
    };

    self.refresh = function(name){
        console.log("before",self.todos);
        Todo.query(function(data) {
            console.log("data " + data[0]);
            self.todos.length = 0;
            for(var i in data){
                if(data[i].id){
                    self.todos.push(data[i]);
                }
            }
        }).$promise.then(function(data) {
            self.placeholderClassName.value = "hidden";
            self.refreshes["navCtrl"]();
        }).catch(function(error) {
            self.handleError(error, "get list");
        });
        console.log("name",name);
        if (name){
            self.refreshes[name]();
        }
    }
    self.refresh();
}]);
