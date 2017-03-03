var testing = require("selenium-webdriver/testing");
var assert = require("chai").assert;
var helpers = require("./e2eHelpers");

testing.describe("end to end", function() {
    this.timeout(20000);
    testing.before(helpers.setupDriver);
    testing.beforeEach(helpers.setupServer);
    testing.afterEach(helpers.teardownServer);
    testing.after(function() {
        helpers.teardownDriver();
        helpers.reportCoverage();
    });

    testing.describe("on page load", function() {
        testing.it("displays TODO title", function() {
            helpers.navigateToSite();
            helpers.getTitleText().then(function(text) {
                assert.equal(text, "TODO List");
            });
        });
        testing.it("displays empty TODO list", function() {
            helpers.navigateToSite();
            helpers.getTodoList().then(function(element) {
                assert.equal(element.length, 0);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("get", "/api/todo");
            helpers.navigateToSite();
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to get list. Server returned 500 - Internal Server Error");
            });
        });
    });
    testing.describe("on create todo item", function() {
        testing.it("clears the input field", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getInputText().then(function(value) {
                assert.equal(value, "");
            });
        });
        testing.it("adds the todo item to the list", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 1);
            });
        });
        testing.it("displays an error if the request fails", function() {
            helpers.setupErrorRoute("post", "/api/todo");
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to create item. Server returned 500 - Internal Server Error");
            });
        });
        testing.it("can be done multiple times", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.addTodo("Another new todo item");
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 2);
            });
        });
    });
    testing.describe("on delete todo item", function() {
        testing.it("after delete it is empty", function() {
            helpers.navigateToSite();
            helpers.addTodo("New todo item");
            helpers.deleteTodo(0);
            helpers.getTodoList().then(function(elements) {
                assert.equal(elements.length, 0);
            });
        });
        testing.it("get eror message for not successfull delete", function() {
            helpers.setupErrorRoute("DELETE", "/api/todo/0");
            helpers.navigateToSite();
            helpers.addTodo("NEw todo");
            helpers.deleteTodo(0);
            helpers.getErrorText().then(function(text) {
                assert.equal(text, "Failed to delete item(s). Server returned 404 - Not Found");
            });
        });
        testing.it("get undo span when deleting single", function() {
            helpers.navigateToSite();
            helpers.addTodo("NEw todo");
            helpers.deleteTodo(0);
            helpers.isUndoSpanVisible();
        });
        testing.it("get undo span when deleting all completed", function() {
            helpers.navigateToSite();
            helpers.addTodo("NEw todo");
            helpers.addTodo("NEw todo2");
            helpers.completeTodo(1);
            helpers.completeTodo(0);
            helpers.navigateToTab("complete");
            helpers.deleteCompletedTodos();
            helpers.isUndoSpanVisible();
        });
    });
    testing.describe("on changing tabs", function() {
        testing.it("going to complete tab deleteComplete not showing", function() {
            helpers.navigateToSite();
            helpers.addTodo("incomplete");
            helpers.navigateToTab("complete");
            helpers.getLabelText().then(function(text) {
                assert.equal(text, "You have 0 TODOs");
            });
            helpers.isDeleteCompleteVisible();
        });
        testing.it("going to complete tab filters to complete", function() {
            helpers.navigateToSite();
            helpers.addTodo("complete");
            helpers.addTodo("incomplete1");
            helpers.addTodo("incomplete2");
            helpers.completeTodo(0);
            helpers.navigateToTab("complete");
            helpers.getLabelText().then(function(text) {
                assert.equal(text, "You have 1 TODOs");
            });
            helpers.getTodoListLabels().then(function(elements) {
                elements[0].getText().then(function(text) {
                    assert.equal(text, "complete");
                });
            });
        });
        testing.it("an all shows all", function() {
            helpers.navigateToSite();
            helpers.addTodo("complete");
            helpers.addTodo("incomplete1");
            helpers.addTodo("incomplete2");
            helpers.completeTodo(0);
            helpers.getLabelText().then(function(text) {
                assert.equal(text, "You have 2 TODOs");
            });
            helpers.navigateToTab("all");
            helpers.getLabelText().then(function(text) {
                assert.equal(text, "You have 3 TODOs");
            });
            helpers.navigateToTab("complete");
            helpers.getLabelText().then(function(text) {
                assert.equal(text, "You have 1 TODOs");
            });
        });
    });
});
