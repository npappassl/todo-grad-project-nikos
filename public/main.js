var app_ang=angular.module("todoApp",["ngResource","ngRoute","ngAnimate"]);angular.module("todoApp").run(function(){console.log("app is runing")}),angular.module("todoApp").config(["$routeProvider",function(a){a.when("/",{controller:"mainCtrl as main",templateUrl:"TodoList.html"}).otherwise({redirectTo:"/"})}]),angular.module("todoApp").directive("nipaComplBut",["interService","Todo",function(a,b){return{restrict:"E",scope:{todo:"=",index:"="},template:'<button id=compl{{index}} class="complButton">✓</button>',link:function(c,d,e,f){d.on("click",function(){b.update({id:c.todo.id},{isComplete:!0}).$promise.then(function(b){a.refresh()}).catch(function(b){a.handleError(b,"update item")})})},controller:function(){console.log("nipaUpdateBut")}}}]),angular.module("todoApp").directive("nipaDelBut",["interService","Todo",function(a,b){return{restrict:"E",scope:{todo:"=",index:"=",display:"="},transclude:!1,template:'<button id=del{{index}} class="delButton">{{dis}}</button>',link:function(c,d,e,f){d.id="del"+c.$index,console.log(c.display),c.dis=c.display,d.on("click",function(){console.log("clicked",f,c),b.delete({id:c.todo.id}).$promise.then(function(b){console.log("deleted",b),a.refresh(),a.showUndoSpan()}).catch(function(b){a.handleError(b,"delete item(s)")})})},controller:function(){console.log("nipaDelBut")}}}]),angular.module("todoApp").factory("Todo",["$resource",function(a){return a("/api/todo/:id",{id:"@id"},{update:{method:"PUT"}})}]),angular.module("todoApp").service("interService",["$timeout","Todo",function(a,b){var c=this;c.refreshes={},c.filterState={value:!1},c.todos=[],c.justDeleted={value:!1},c.placeholderClassName={value:""},c.errorDiv={text:""},c.handleError=function(a,b){a&&(c.errorDiv.text="Failed to "+b+". Server returned "+a.status+" - "+a.statusText)},c.setUndo=function(a){c.justDeleted=a},c.showUndoSpan=function(){c.justDeleted.value=!0},c.hideUndoSpan=function(){c.justDeleted.value=!1},c.getError=function(){return c.errorDiv},c.getFilter=function(){return c.filterState},c.getTodos=function(){return c.todos},c.getPlaceholderClassName=function(){return c.placeholderClassName},c.setRefresh=function(a,b){c.refreshes[a]=function(){b()}},c.updateDB=function(a){b.update({id:a.id},{title:a.title}),c.refresh()},c.refresh=function(a){console.log("before",c.todos),b.query(function(a){console.log("data "+a[0]),c.todos.length=0;for(var b in a)a[b].id&&c.todos.push(a[b])}).$promise.then(function(a){c.placeholderClassName.value="hidden",c.refreshes.navCtrl()}).catch(function(a){c.handleError(a,"get list")}),console.log("name",a),a&&c.refreshes[a]()},c.refresh()}]),angular.module("todoApp").service("pollService",["interService","$timeout","Todo",function(a,b,c){var d=this;d.stateId=-1,d.tick=function(){c.get({id:"state"}).$promise.then(function(b){b.state!==d.stateId&&(d.stateId=b.state,a.refresh())}).catch(function(a){console.log(a,"offline")}),b(function(){d.tick()},1e3)},d.tick()}]),angular.module("todoApp").controller("TodoListCtrl",["interService","Todo",function(a,b){console.log("TodoListCtrl","init");var c=this;c.todos={value:a.getTodos()},c.state={placeholderClassName:a.getPlaceholderClassName(),filterState:a.getFilter(),error:a.getError()},c.editedTodo=null,c.updateTodo=function(a,b){c.editedTodo=b,c.originalTodo=angular.extend({},b),setTimeout(function(){a.target.parentNode.getElementsByClassName("edit")[0].focus()},200)},c.updateDB=function(b){a.updateDB(b)}}]),angular.module("todoApp").controller("mainCtrl",["$timeout","Todo",function(a,b){console.log("mainCtrl","init")}]),angular.module("todoApp").controller("navCtrl",["interService",function(a){console.log("navCtrl","init");var b=this;b.todos={value:a.getTodos()},b.nav={onGoing:{class:"active"},complete:{class:""},all:{class:""}},b.refresh=function(){b.nav.all.size=b.todos.value.length,b.nav.complete.size=b.todos.value.filter(function(a){return a.isComplete}).length,b.nav.onGoing.size=b.nav.all.size-b.nav.complete.size},b.getTab=function(a){var c={complete:{filterS:!0,complete:"active",onGoing:"",all:""},onGoing:{filterS:!1,complete:"",onGoing:"active",all:""},all:{filterS:"",complete:"",onGoing:"",all:"active"}};b.nav.complete.class=c[a].complete,b.nav.onGoing.class=c[a].onGoing,b.nav.all.class=c[a].all,b.filterState.value=c[a].filterS},b.filterState=a.getFilter(),a.setRefresh("navCtrl",b.refresh),b.refresh()}]),angular.module("todoApp").controller("newPostCtrl",["interService","Todo",function(a,b){var c=this;c.newTodoField="",c.addTodo=function(){var d={title:c.newTodoField.trim(),isComplete:!1};d.title&&b.save(d).$promise.then(function(b){c.newTodoField="",a.refresh()}).catch(function(b){a.handleError(b,"create item")})}}]),angular.module("todoApp").controller("undoCtrl",["interService","Todo",function(a,b){console.log("undoCtrl","init");var c=this;c.justDeleted={value:!1},a.setUndo(c.justDeleted),c.hideUndoSpan=function(){a.hideUndoSpan(),a.refresh()},c.undoDelete=function(){a.hideUndoSpan(),b.update({id:"undo"},function(b){a.refresh()}).$promise.catch(function(b){a.handleError(b,"undo")})}}]);