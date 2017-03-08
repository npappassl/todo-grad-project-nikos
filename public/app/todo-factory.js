// Creates the $resource connection to the server
angular.module("todoApp").factory("Todo", ["$resource" , function($resource) {
    var TodoObject = $resource("/api/todo/:id", {id: "@id"}, {
        "update": {method: "PUT"}
    });
    return TodoObject;
}]);
