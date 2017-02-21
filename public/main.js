var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var specChar = {"tick": "&#x2713;", "pen": "&#x2712;"};
var activatedTab = 1;

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

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
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: false
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var fetchProps = {
        method: "GET"
    };
    fetch("/api/todo", fetchProps)
        .then(checkStatus)
        .then(parseJSON)
        .then(function(response) {
            callback(response);
        }).catch(function(err) {
            console.error(err);
            error.textContent = "Failed to get list. Server returned " +
                err.response.status + " - " + err.response.statusText;
        });
}

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
}

function parseJSON(response) {
    return response.json();
}

function deleteTodo(todo, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + todo.id);
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            window.alert("could not delete item " + todo.id);
        }
    };
    createRequest.send();
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
            deleteAllComplete(reloadTodoList);
        };
        document.getElementById("todo-list").appendChild(but);
    }
}

function deleteAllComplete(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/complete");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            window.alert("could not delete items");
        }
    };
    createRequest.send();
}

function updateListItem(todo, callback) {
    console.log(li);
    var textUpdateSpan = document.createElement("span");
    textUpdateSpan.className = "updateSpan";
    var inputTxt = document.createElement("input");
    inputTxt.className = "updateTxt";
    var li = document.getElementById("li" + todo.id);
    inputTxt.type = "text";
    inputTxt.value = todo.title;
    console.log(todo);

    var inputSubmit = document.createElement("button");
    inputSubmit.type = "submit";
    inputSubmit.innerHTML = specChar.tick;
    inputSubmit.className = "confirmUpdate";
    inputSubmit.onclick = function () {
        updateListItemDB(todo.id, inputTxt, callback);
    };

    var cancelUpdate = document.createElement("button");
    cancelUpdate.innerHTML = "X";
    cancelUpdate.onclick = function() {
        li.removeChild(textUpdateSpan);
    };

    textUpdateSpan.appendChild(cancelUpdate);
    textUpdateSpan.appendChild(inputSubmit);
    textUpdateSpan.appendChild(inputTxt);
    if (li.getElementsByClassName("updateSpan").length === 0) {
        li.appendChild(textUpdateSpan);
    }
}

function updateListItemDB(id, inputTxt, callback) {
    var createRequest = new XMLHttpRequest();
    var title = inputTxt.value;
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
    }));
    createRequest.onload = function () {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update " + this.status + " - " + this.responseText;
        }
    };
}

function doneTodo(todo, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + todo.id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        isComplete: true
    }));
    createRequest.onload = function () {
        if (this.status === 200) {
            callback();
        } else {
            error.textContent = "Failed to update " + this.status + " - " + this.responseText;
        }
    };
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
function fetchRequest() {
    var promise = fetch("/api/todo/");
    promise.then(function (response) {
        console.log("promise fullfilled");
        console.log(response.json());
    }, function() {
        console.log("promise not fullfilled");
    });
    console.log(promise);
}
reloadTodoList();
