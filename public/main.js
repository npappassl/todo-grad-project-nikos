var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
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
    nav[num].className = "active";
    nav[nav.length - num - 1].className = "";
    activatedTab = num;
    reloadTodoList();
}
function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title
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
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function deleteTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("DELETE", "/api/todo/" + id);
    createRequest.onload = function() {
        if (this.status === 200) {
            callback();
        } else {
            window.alert("could not delete item " + id);
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
        var listItem;
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            if (activatedTab === 0) {
                if (todo.done) {
                    listItem = createListItem(todo);
                    todoList.appendChild(listItem);
                }
            } else {
                if (!todo.done) {
                    listItem = createListItem(todo);
                    todoList.appendChild(listItem);
                }
            }
        });
    });
}
function updateListItem(todo, callback) {
    var textUpdateSpan = document.createElement("span");
    textUpdateSpan.className = "updateSpan";
    var inputTxt = document.createElement("input");
    inputTxt.className = "updateTxt";

    var li = document.getElementById("li" + todo.id);
    inputTxt.type = "text";
    inputTxt.value = todo.title;

    var inputSubmit = document.createElement("button");
    inputSubmit.type = "submit";
    inputSubmit.innerHTML = "&#x2713;";
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

function doneTodo(id, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("PUT", "/api/todo/" + id);
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        done: true
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
    var updateButton = document.createElement("button");
    updateButton.id = "update" + todo.id;
    updateButton.innerHTML = "&#x2712;";
    updateButton.onclick = function() {
        updateListItem(todo, reloadTodoList);
    };
    var completeButton = document.createElement("button");
    completeButton.id = "comp" + todo.id;
    completeButton.innerHTML = "&#x2713;";
    completeButton.onclick = function() {
        doneTodo(todo.id, reloadTodoList);
    };
    var deleteButton = document.createElement("button");
    deleteButton.id = "del" + todo.id;
    deleteButton.innerHTML = "X";
    deleteButton.onclick = function() {
        deleteTodo(todo.id, reloadTodoList);
    };

    listItem.appendChild(numbering);
    listItem.appendChild(todoText);
    listItem.appendChild(deleteButton);
    listItem.appendChild(completeButton);
    listItem.appendChild(updateButton);

    return listItem;
}

reloadTodoList();
