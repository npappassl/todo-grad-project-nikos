var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var specChar = {"tick": "&#x2713;", "pen": "&#x2712;"};
var statusCode = {"notFound": 404, "ok": 200, "created": 201};
var activatedTab = 1;
var intervalMain = window.setInterval(isStateUpdated, 5000);
var stateId = 0;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function isStateUpdated() {
    var promise = fetch("api/todo/state");
    promise.then(checkStatusOK)
        .then(parseJSON)
        .then(function(response) {
            if (response !== stateId) {
                stateId = response;
                reloadTodoList();
            }
        }).catch(function(err) {
            console.log(err);
            error.textContent = "Failed get server state. Server returned " +
                err.response.status + " - " + err.response.statusText;
        });
}

function activateTab(num) {
    var nav = document.getElementsByTagName("nav")[0].getElementsByTagName("span");
    activatedTab = num;
    for (var i = 0;i < 3;i++) {
        if (num === i) {
            nav[i].className = "active";
        } else {
            nav[i].className = "";
        }
    }
    reloadTodoList();
}

function createTodo(title, callback) {
    var reqBody = JSON.stringify({
        title: title,
        isComplete: false
    });
    var fetchProps = {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: reqBody
    };
    var promise = fetch("/api/todo", fetchProps);
    promise.then(checkStatusCreated)
        .then(callback)
        .catch(function(err) {
            console.error(err);
            error.textContent = "Failed to create item. Server returned " +
                err.response.status + " - " + err.response.statusText;
        });
}

function getTodoList(callback) {
    var fetchProps = {
        method: "GET"
    };
    fetch("/api/todo", fetchProps)
        .then(checkStatusOK)
        .then(parseJSON)
        .then(function(response) {
            stateId = parseInt(response.state);
            callback(response.todos);
        }).catch(function(err) {
            console.error(err);
            error.textContent = "Failed to get list. Server returned " +
                err.response.status + " - " + err.response.statusText;
        });
}

function checkStatusOK(response) {
    if (response.status === statusCode.ok) {
        return response;
    } else {
        var err = new Error(response.statusText);
        err.response = response;
        throw err;
    }
}
function checkStatusCreated(response) {
    if (response.status === statusCode.created) {
        return response;
    } else {
        var err = new Error(response.statusText);
        err.response = response;
        throw err;
    }
}

function parseJSON(response) {
    return response.json();
}

function deleteTodo(todo, callback) {
    var fetchProps = {method: "DELETE"};
    var promise;
    if (todo) {
        promise = fetch("/api/todo/" + todo.id, fetchProps);
    } else {
        promise = fetch("/api/todo/complete", fetchProps);
    }
    promise.then(checkStatusOK)
        .then(function(response) {
            callback(response);
            showUndoSpan();
        }).catch(function(err) {
            console.error(err);
            error.textContent = "Failed to delete item(s). Server returned " +
              err.response.status + " - " + err.response.statusText;
        });
}

function undoDelete() {
    hideUndoSpan();
    var fetchProps = {method: "PUT"};
    var promise = fetch("api/todo/undo", fetchProps);
    promise.then(checkStatusOK)
        .then(reloadTodoList)
        .catch(function(err) {
            console.error(err);
            error.textContent = "Failed to undo. Server returned " +
              err.response.status + " - " + err.response.statusText;
        });
}
function showUndoSpan() {
    document.getElementById("undoSpan").style.display = "inline-block";
    window.setTimeout(hideUndoSpan, 5000);
}
function hideUndoSpan() {
    document.getElementById("undoSpan").style.display = "none";
}

function reloadTodoList() {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    getTodoList(function(todos) {
        todos = filterTodos(todos);
        var listItem;
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            listItem = createListItem(todo);
            todoList.appendChild(listItem);
        });
        addDeleteAllButton(todos.length);
        updateLabel(todos.length);
    });
}
function filterTodos(todos) {
    if (activatedTab === 0) {
        todos = todos.filter(function(todo) {
            return todo.isComplete;
        });
    } else if (activatedTab === 1) {
        todos = todos.filter(function(todo) {
            return !todo.isComplete;
        });
    }
    return todos;
}
function addDeleteAllButton(completeLength) {
    if (activatedTab === 0 &&
        completeLength > 0) {

        var but = document.createElement("button");
        but.innerHTML = "Delete Complete";
        but.id = "deleteComplete";
        but.onclick = function () {
            deleteTodo(null, reloadTodoList);
        };
        document.getElementById("todo-list").appendChild(but);
    }
}

function updateListItem(todo, callback) {
    var textUpdateSpan = document.createElement("span");
    textUpdateSpan.className = "updateSpan";
    var inputTxt = document.createElement("input");
    inputTxt.className = "updateTxt";
    var li = document.getElementById("li" + todo.id);
    inputTxt.type = "text";
    inputTxt.value = todo.title;

    var inputSubmit = createItemButton(todo, specChar.tick, "conf", function () {
        updateListItemDB(todo.id, inputTxt, callback);
    });
    inputSubmit.className = "confirmUpdate";

    var cancelUpdate = createItemButton(todo, "X", "cancUp", function() {
        li.removeChild(textUpdateSpan);
    });

    textUpdateSpan.appendChild(cancelUpdate);
    textUpdateSpan.appendChild(inputSubmit);
    textUpdateSpan.appendChild(inputTxt);
    if (li.getElementsByClassName("updateSpan").length === 0) {
        li.appendChild(textUpdateSpan);
    }
}

function updateListItemDB(id, inputTxt, callback) {
    var reqBody = JSON.stringify({
        title: inputTxt.value
    });
    var fetchProps = {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body : reqBody
    };
    var promise = fetch("/api/todo/" + id, fetchProps);
    promise.then(checkStatusOK)
        .then(function(response) {
            callback(response);
        }).catch(function(err) {
            console.error(err);
            error.textContent = "Failed to update " +
                err.response.status + " - " + err.response.statusText;
        });
}

function doneTodo(todo, callback) {
    var reqBody = JSON.stringify({
        isComplete: true
    });
    var fetchProps = {
        method: "PUT",
        headers: {
            "Content-type": "application/json"
        },
        body : reqBody
    };
    var promise = fetch("/api/todo/" + todo.id, fetchProps);
    promise.then(checkStatusOK)
        .then(function(response) {
            callback(response);
        }).catch(function(err) {
            console.error(err);
            error.textContent = "Failed to update " +
              err.response.status + " - " + err.response.statusText;
        });
}

function createListItem(todo) {
    var listItem = document.createElement("li");
    listItem.id = "li" + todo.id;
    var numbering = document.createElement("span");
    numbering.className = "numbering";
    numbering.innerHTML = document.getElementsByClassName("numbering").length + 1;
    var todoText = document.createElement("span");
    todoText.className = "todoTextBody";
    todoText.textContent = todo.title;

    var updateButton = createItemButton(todo, specChar.pen, "update", updateListItem);
    var deleteButton = createItemButton(todo, "X", "del", deleteTodo);

    var buttonSpan = document.createElement("span");
    buttonSpan.className = "buttonSpan";
    listItem.appendChild(numbering);
    listItem.appendChild(todoText);
    buttonSpan.appendChild(deleteButton);
    if (!todo.isComplete) {
        var completeButton = createItemButton(todo, specChar.tick, "comp", doneTodo);
        buttonSpan.appendChild(completeButton);
    }

    buttonSpan.appendChild(updateButton);
    listItem.appendChild(buttonSpan);

    return listItem;
}

function createItemButton(todo, char, butId, action) {
    var button = document.createElement("button");
    button.id = butId + todo.id;
    button.innerHTML = char;
    button.onclick = function() {
        action(todo, reloadTodoList);
    };
    return button;
}

function updateLabel(listLength) {
    var label = document.getElementById("count-label");
    if (activatedTab === 0) {
        if (listLength === 0) {
            label.innerHTML = "You haven't completed any TODOs";
        } else if (listLength === 1) {
            label.innerHTML = "You have completed one TODO";
        } else {
            label.innerHTML = "You have completed " + listLength + " TODOs";
        }
    } else if (activatedTab === 1) {
        if (listLength === 0) {
            label.innerHTML = "You don't have any pending TODOs";
        } else if (listLength === 1) {
            label.innerHTML = "You have one TODO";
        } else {
            label.innerHTML = "There are " + listLength + " TODOs to complete";
        }
    } else {
        if (listLength === 0) {
            label.innerHTML = "You don't have any kind of TODOs";
        } else if (listLength === 1) {
            label.innerHTML = "You have one TODO in general";
        } else {
            label.innerHTML = "There are " + listLength + " TODOs either complete or not";
        }
    }
}

reloadTodoList();
isStateUpdated();
