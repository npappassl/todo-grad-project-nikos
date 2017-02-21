var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");

var status = {"notFound": 404, "ok": 200, "created": 201};

module.exports = function(port, middleware, callback) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function(req, res) {
        var todo = req.body;
        todo.isComplete = false;
        todo.id = latestId.toString();
        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(status.created);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(status.ok);
        } else {
            res.sendStatus(status.notFound);
        }
    });

    // Update
    app.put("/api/todo/:id", function(req, res) {
        console.log(req.body);
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            if (req.body.title) {
                todo.title = req.body.title;
            }
            if (req.body.isComplete) {
                todo.isComplete = req.body.isComplete;
            }
            res.sendStatus(status.ok);
        } else {
            res.sendStatus(status.notFound);
        }
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function(connection) {
        connections.push(connection);
    });

    return {
        close: function(callback) {
            connections.forEach(function(connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
