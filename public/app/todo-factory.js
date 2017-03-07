// Creates the $resource connection to the server
app_ang.factory("Todo", ["$resource" , function($resource) {
    var TodoObject = $resource("/api/todo/:id", {id: "@id"}, {
        "update": {method: "PUT"}
    });
    return TodoObject;
}]);
