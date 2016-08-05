/**
 * Created by brance on 2016/8/1.
 */

/*
* The data of the component is just a list of items, in which one particular item can be selected and
* deleted. So, the model of the component is very simple - it consists of an array and a selected item
* index; and here it is:
*/

//The Model.model stores items and notifies.
//observers about changes.

function ListModel(items){

    this._items = items;
    this._selectedIndex = -1;

    this.itemAdded = new Event(this);
    this.itemRemoved = new Event(this);
    this.selectedIndexChanged = new Event(this);
}

ListModel.prototype = {

    getItems:function(){
        return [].concat(this._items);
    },
    addItem:function(){
        this._items.push(item);
        this.itemAdded.notify({item:item});
    },

    removeItemAt:function(index){
        var item;
        item = this._items[index];
        this._items.splice(index,1);
        this.itemRemoved.notify({item:item});
        if(index === this._selectedIndex){
            this.setSelectedIndex(-1);
        }


    },

    getSelectedIndex:function(){
        return this._selectedIndex;
    },

    setSelectedIndex:function(index){
        var previousIndex;

        previousIndex = this._selectedIndex;
        this._selectedIndex = index;
        this.selectedIndexChanged.notify({ previous : previousIndex });
    }

};

//Event is a simple class for implementing the Observer pattern.
function Event(){
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach:function(listener){

        this._listeners.push(listener);
    },

    notify:function(args){
        var index;

        for(index=0;index < this._listeners.length;index++){
            this._listeners[index](this._sender,args);
        }
    }
};

//the view classes require defining controllers for interacting with.There are numerous
// alternatives of interface for the task, but I prefer a most simple one. I want my items
// to be in a Listbox control and two buttons below it: “plus” button for adding items and
// “minus” for removing selected item. I want my items to be in a Listbox control and two
// buttons below it: “plus” button for adding items and “minus” for removing selected item.
// A View class is tightly bound with a Controller class, which “… handles the input event
// from the user interface, often via a registered handler or callback” (from wikipedia.org).

//Here are the View and Controller classes:


/*
* The View.View presents the model and providesthe UI events.The controller is attached to
* these events to handle the interaction.
*/


function ListView (model,elements){
    this._model =model;
    this._elements = elements;

    this.listModified = new Event(this);
    this.addButtonClicked = new Event(this);
    this.delButtonClicked = new Event(this);

    var _this = this;

    //attach model listeners;

    this._model.itemAdded.attach(function(){
        _this.rebuildList();
    });

    this._model.itemRemoved.attach(function(){
        _this._model.rebuildList();
    });

    //attach listeners to HTML controllers.

    this._elements.list.change(function(e){
        _this.listModified.notify({index: e.target.selectedIndex});
    });

    this._elements.addButton.click(function(){
        _this.addButtonClicked.notify();
    });

    this._elements.delButton.click(function(){
        _this.delButtonClicked.notify();
    });
}

ListView.prototype = {
    show:function(){
        this.rebuildList();
    },
    rebuildList:function(){
        var list,items,key;

        list = this._elements.list;
        list.html('');

        items = this._model.getItems();
        for(key in items){
            if(items.hasOwnProperty(key)){
                list.append($('<option>' + items[key] + '</option>'));
            }
        }
        this._model.setSelectedIndex(-1);
    }
};

//the controller.Controller responds to user actions ang invokes changes on the model.

function ListController (model,view){
    this._model = model;
    this._veiw = view;

    var _this = this;

    this._view.listModified.attach(function(sender,args){
        _this.updateSelected(args.index);
    });

    this._veiw.addButtonClicked.attach(function(){
        _this.addItem();
    });

    this._view.delButtonClicked.attach(function () {
        _this.delItem();
    });
}

ListController.prototype = {
    addItem:function(){
        var item = window.prompt('Add item:', '');
        if (item) {
            this._model.addItem(item);
        }
    },
    delItem:function(){
        var index;

        index = this._model.getSelectedIndex();
        if(index !== -1){
            this._model.removeItemAt(this._model.getSelectedIndex());
        }
    },
    updateSelected:function(index){
        this._model.setSelectedIndex(index);
    }
};

//And of course, the Model, View, and Controller classes should be instantiated. The sample,
// which you can below, uses the following code to instantiate and configure the classes:

$(function () {
    var model = new ListModel(['PHP', 'JavaScript']),
        view = new ListView(model, {
            'list' : $('#list'),
            'addButton' : $('#plusBtn'),
            'delButton' : $('#minusBtn')
        }),
        controller = new ListController(model, view);

    view.show();
});



