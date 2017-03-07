var app_ang = angular.module("todoApp");

// Creates the $resource connection to the server
app_ang.factory("Todo", function($resource) {
    var TodoObject = $resource("/api/todo/:id", {id: "@id"}, {
        "update": {method: "PUT"}
    });
    return TodoObject;
});
