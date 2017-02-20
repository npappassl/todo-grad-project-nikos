var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

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
        todoListPlaceholder.style.display = "none";
        todos.forEach(function(todo) {
            var listItem = createListItem(todo);
            todoList.appendChild(listItem);
        });
    });
}
function updateListItem(todo, callback) {
    var textUpdateSpan = document.createElement("span");
    var inputTxt = document.createElement("input");
    inputTxt.type = "text";
    inputTxt.value = todo.title;
    var inputSubmit = document.createElement("input");
    inputSubmit.type = "submit";
    inputSubmit.onclick = function () {
        updateListItemDB(todo.id, inputTxt, callback);
    };
    textUpdateSpan.appendChild(inputSubmit);
    textUpdateSpan.appendChild(inputTxt);
    var li = document.getElementById("li" + todo.id);
    li.appendChild(textUpdateSpan);
    console.log(todo.id);
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
function createListItem(todo) {
    var listItem = document.createElement("li");
    listItem.id = "li" + todo.id;
    var todoText = document.createElement("span");
    todoText.className = "todoTextBody";
    todoText.textContent = todo.title;
    var updateButton = document.createElement("button");
    updateButton.id = "update" + todo.id;
    updateButton.innerHTML = "&#x2712;";
    updateButton.onclick = function () {
        updateListItem(todo, reloadTodoList);
    };
    var completeButton = document.createElement("button");
    completeButton.id = "comp" + todo.id;
    completeButton.innerHTML = "&#x2713;";
    var deleteButton = document.createElement("button");
    deleteButton.id = "del" + todo.id;
    deleteButton.innerHTML = "x";
    deleteButton.onclick = function () {
        deleteTodo(todo.id, reloadTodoList);
    };
    listItem.appendChild(todoText);
    listItem.appendChild(deleteButton);
    listItem.appendChild(completeButton);
    listItem.appendChild(updateButton);
    return listItem;
}

reloadTodoList();
