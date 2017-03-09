var express = require("express");
var createServer = require("../server/server");
var webdriver = require("selenium-webdriver");
var istanbul = require("istanbul");
var path = require("path");
var fs = require("fs");

var testPort = 52684;
var baseUrl = "http://localhost:" + testPort;
var instrumenter = new istanbul.Instrumenter();
var collector = new istanbul.Collector();
var gatheringCoverage = process.env.running_under_istanbul;
var coverageFilename = "build_artifacts/coverage-e2e.json";

var driver;
var router;
var server;

module.exports.setupDriver = function() {
    driver = new webdriver.Builder().forBrowser("chrome").build();
};

module.exports.setupServer = function(done) {
    router = express.Router();
    if (gatheringCoverage) {
        router.get("/main.js", function(req, res) {
            var absPath = path.join(__dirname, "..", "public", "main.js");
            res.send(instrumenter.instrumentSync(fs.readFileSync("public/main.js", "utf8"), absPath));
        });
    }
    server = createServer(testPort, router, done);
};

module.exports.teardownServer = function(done) {
    server.close(done);
};

module.exports.teardownDriver = function() {
    if (gatheringCoverage) {
        driver.executeScript("return __coverage__;").then(function (coverage) {
            collector.add(coverage);
        });
    }
    driver.quit();
};

module.exports.reportCoverage = function() {
    if (gatheringCoverage) {
        fs.writeFileSync(coverageFilename, JSON.stringify(collector.getFinalCoverage()), "utf8");
    }
};

module.exports.navigateToSite = function() {
    driver.get(baseUrl);
};

module.exports.navigateToTab = function(tab) {
    driver.findElement(webdriver.By.id("nav-" + tab)).click();
};
module.exports.getTitleText = function() {
    return driver.findElement(webdriver.By.css("h1")).getText();
};

module.exports.getInputText = function() {
    var newTodo = driver.findElement(webdriver.By.id("new-todo"));
    driver.wait(webdriver.until.elementIsVisible(newTodo), 5000);
    return newTodo.getAttribute("value");
};

module.exports.getErrorText = function() {
    var errorElement = driver.findElement(webdriver.By.id("error"));
    driver.wait(webdriver.until.elementTextContains(errorElement, "Failed"), 5000);
    return errorElement.getText();
};

module.exports.getLabelText = function() {
    var labelElement = driver.findElement(webdriver.By.id("count-label"));
    driver.wait(webdriver.until.elementTextContains(labelElement, "have"), 5000);
    return labelElement.getText();
};

module.exports.getTodoList = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li"));
};

module.exports.getTodoListLabels = function() {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    return driver.findElements(webdriver.By.css("#todo-list li label"));
};

module.exports.addTodo = function(text) {
    var newTodo = driver.findElement(webdriver.By.css("#new-todo"));
    var submitTodo = driver.findElement(webdriver.By.id("submit-todo"));
    driver.wait(webdriver.until.elementIsVisible(newTodo), 5000);
    driver.wait(webdriver.until.elementIsVisible(submitTodo), 5000);
    newTodo.sendKeys(text);
    submitTodo.click();
};
module.exports.deleteTodo = function(index) {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    var delBut = driver.findElement(webdriver.By.id("del" + index));
    delBut.click();
};
module.exports.completeTodo = function(index) {
    var todoListPlaceholder = driver.findElement(webdriver.By.id("todo-list-placeholder"));
    driver.wait(webdriver.until.elementIsNotVisible(todoListPlaceholder), 5000);
    var complBut = driver.findElement(webdriver.By.id("compl" + index));
    complBut.click();
};
module.exports.deleteCompletedTodos = function() {
    var deleteCompleteBut = driver.findElement(webdriver.By.id("delComplete"));
    driver.wait(webdriver.until.elementIsVisible(deleteCompleteBut), 5000);
    deleteCompleteBut.click();
};
module.exports.isUndoSpanVisible = function() {
    var undoSpan = driver.findElement(webdriver.By.id("undoSpan"));
    driver.wait(webdriver.until.elementTextContains(undoSpan, "You just"), 5000);
};
module.exports.isDeleteCompleteNotVisible = function() {
    var deleteCompleteBut = driver.findElement(webdriver.By.id("delComplete"));
    driver.wait(webdriver.until.elementIsNotVisible(deleteCompleteBut), 5000);
    return true;
};
module.exports.setupErrorRoute = function(action, route) {
    if (action === "get") {
        router.get(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "post") {
        router.post(route, function(req, res) {
            res.sendStatus(500);
        });
    }
    if (action === "DELETE") {
        router.delete(route, function(req, res) {
            res.sendStatus(404);
        });
    }
};
