var server = require("../server/server");
var request = require("request");
var assert = require("chai").assert;

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var todoListUrl = baseUrl + "/api/todo";

describe("server", function() {
    var serverInstance;
    beforeEach(function() {
        serverInstance = server(testPort);
    });
    afterEach(function() {
        serverInstance.close();
    });
    describe("get list of todos", function() {
        it("responds with status code 200", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.statusCode, 200);
                done();
            });
        });
        it("responds with a body encoded as JSON in UTF-8", function(done) {
            request(todoListUrl, function(error, response) {
                assert.equal(response.headers["content-type"], "application/json; charset=utf-8");
                done();
            });
        });
        it("responds with a body that is a JSON empty array", function(done) {
            request(todoListUrl, function(error, response, body) {
                assert.equal(body, "[]");
                done();
            });
        });
    });
    describe("create a new todo", function() {
        it("responds with status code 201", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function(error, response) {
                assert.equal(response.statusCode, 201);
                done();
            });
        });
        it("responds with the location of the newly added resource", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function(error, response) {
                assert.equal(response.headers.location, "/api/todo/0");
                done();
            });
        });
        it("inserts the todo at the end of the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.get(todoListUrl, function(error, response, body) {
                    assert.deepEqual(JSON.parse(body), [{
                        title: "This is a TODO item",
                        isComplete: false,
                        id: "0"
                    }]);
                    done();
                });
            });
        });
    });
    describe("delete a todo", function() {
        it("responds with status code 404 if there is no such item", function(done) {
            request.del(todoListUrl + "/0", function(error, response) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("responds with status code 200", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.del(todoListUrl + "/0", function(error, response) {
                    assert.equal(response.statusCode, 200);
                    done();
                });
            });
        });
        it("removes the item from the list of todos", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.del(todoListUrl + "/0", function() {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body), []);
                        done();
                    });
                });
            });
        });
    });
    describe("delete no incomplete", function() {
        it("no incomplete is deleted", function(done) {
            put3Incomplete(function(body) {
                assert.deepEqual(JSON.parse(body), [{title: "This is a TODO item", isComplete: false, id: "0"},
                                                    {title: "This is a TODO item", isComplete: false, id: "1"},
                                                    {title: "This is a TODO item", isComplete: false, id: "2"}]);
                request.del(todoListUrl + "/complete", function (error, response) {
                    request.get(todoListUrl, function(error, response, body) {
                        assert.deepEqual(JSON.parse(body),
                            [{title: "This is a TODO item", isComplete: false, id: "0"},
                            {title: "This is a TODO item", isComplete: false, id: "1"},
                            {title: "This is a TODO item", isComplete: false, id: "2"}]);
                        done();

                    });

                });
            });
        });
    });
    describe("delete all completed", function() {
        it("no complete is left in the todos", function(done) {
            put3Incomplete(function() {
                put3Incomplete(function() {
                    put3Complete(1, 3, 4, function(body) {
                        assert.deepEqual(JSON.parse(body), [
                            {title: "This is a TODO item", isComplete: false, id: "0"},
                            {title: "This is a TODO item", isComplete: true, id: "1"},
                            {title: "This is a TODO item", isComplete: false, id: "2"},
                            {title: "This is a TODO item", isComplete: true, id: "3"},
                            {title: "This is a TODO item", isComplete: true, id: "4"},
                            {title: "This is a TODO item", isComplete: false, id: "5"}]);
                        var finalUrl = todoListUrl + "/complete";
                        request({

                            method: "DELETE",
                            url: finalUrl
                        }, function(response) {
                            request.get(todoListUrl, function(error, response, body) {
                                if (error) {
                                    console.error(error);
                                }
                                assert.equal(JSON.parse(body).length, 3);
                                done();
                            });
                        });
                    });
                });
            });
        });
    });
    describe("update a todo", function() {
        it("id is the same", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.put({
                    url: todoListUrl + "/0",
                    json: {
                        title: "this is edited"
                    }
                }, function() {
                    request.get(todoListUrl, function(error, response, body) {
                        if (response.statusCode === 200) {
                            assert.deepEqual(JSON.parse(body), [{title: "this is edited", isComplete: false, id: "0"}]);
                            done();
                        }else {
                            assert.equal(response.statusCode, 404);
                            done();
                        }
                    });
                });
            });
        });
        it("404 is returned when not found", function(done) {
            request.put({
                url: todoListUrl + "/0",
                json: {
                    title: "this is edited"
                }
            }, function (error, response, body) {
                assert.equal(response.statusCode, 404);
                done();
            });
        });
        it("id is the same", function(done) {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.put({
                    url: todoListUrl + "/0",
                    json: {
                        isComplete: true
                    }
                }, function() {
                    request.get(todoListUrl, function(error, response, body) {
                        if (response.statusCode === 200) {
                            assert.deepEqual(JSON.parse(body),
                             [{title: "This is a TODO item", isComplete: true, id: "0"}]);
                            done();
                        }else {
                            assert.equal(response.statusCode, 404);
                            done();
                        }
                    });
                });
            });
        });
    });
});

function put3Incomplete(callback) {
    request.post({
        url: todoListUrl,
        json: {
            title: "This is a TODO item",
            isComplete: false
        }
    }, function() {
        request.post({
            url: todoListUrl,
            json: {
                title: "This is a TODO item",
                isComplete: false
            }
        }, function() {
            request.post({
                url: todoListUrl,
                json: {
                    title: "This is a TODO item",
                    isComplete: false
                }
            }, function() {
                request.get(todoListUrl, function (error, response, body) {
                    if (error) {
                        console.error(error);
                        return;
                    }
                    if (callback) {
                        callback(body);
                    }
                });
            });
        });
    });
}
function put3Complete(id1, id2, id3, callback) {
    request.put({
        url: todoListUrl + "/" + id1,
        json: {
            isComplete: true
        }
    }, function() {
        request.put({
            url: todoListUrl + "/" + id2,
            json: {
                  isComplete: true
              }
        }, function() {
              request.put({
                  url: todoListUrl + "/" + id3,
                  json: {
                      isComplete: true
                  }
              }, function() {
                  request.get(todoListUrl, function (error, response, body) {
                      if (error) {
                          console.error(error);
                          return;
                      }
                      if (callback) {
                          callback(body);
                      }
                  });
              });
          });
    });
}
