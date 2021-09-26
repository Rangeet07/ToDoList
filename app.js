const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js")
const mongoose = require("mongoose")
const _ = require("lodash");

const app = express();

// let items = ["Buy Food", "Cook Food", "Eat Food"];
// let workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Rangeet_demo:Qwerty133@cluster0.5sfyb.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = new mongoose.Schema ({ 
	name: String

});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({

	name: "Welcome to your todolist!"

});
const item2 = new Item({

	name: "Hit the + button to add a new item."

});
const item3 = new Item({

	name: "<-- Hit this to delete an item."

});

const defaultItems = [item1, item2, item3];
const listSchema = {
	name: String,
	items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){
//res.send("Hello World");
// let day = date.getDate();
Item.find({}, function(err, foundItems){
	if(foundItems.length === 0){
	Item.insertMany(defaultItems, function(err){
	if (err){
		console.log(err);
	} else {
		console.log("Successfully saved default items to DB.");
	}
    });
    res.redirect("/");
	} else {
	res.render("list", {listTitle: "Today" , newListItems: foundItems});
		}
});
});

app.get("/:customListName", function(req, res){
	const customListName = _.capitalize(req.params.customListName);
	List.findOne({name: customListName}, function(err, foundList){
		if(!err){
			if(!foundList){
			// console.log("Doesn't exist!");
			const list = new List({
				name: customListName,
				items: defaultItems
			});
			list.save();
			res.redirect("/" + customListName);
		} else {
			// console.log("Exists!");
			res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
		}
		}
	});

});

app.post("/", function(req, res){
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item({
		name : itemName
	});

	if(listName === "Today"){
		item.save();
		res.redirect("/");
	}  else {
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);

		});
	}
});

app.post("/delete", function(req, res){
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if(listName === "Today"){
	Item.findByIdAndRemove(checkedItemId, function(err){
	if(!err){
		console.log("Successfully deleted checked item.");
		res.redirect("/");
	  }
	  });
} else {
	List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}} , function(err, foundList){
		if(!err){
			res.redirect("/" + listName);
		}
	});
}
//console.log(req.body.checkbox);

});




// app.get("/work", function(req, res){
// 	res.render("list", {listTitle: "Work List", newListItems: workItems})
// });
app.post("/work", function(req, res){
	let item = req.body.newItem;
	workItems.push(item);
	res.redirect("/work");
});

app.get("/about", function(req, res){
	res.render("about");
})

app.listen(3000, function(){

console.log("Server runnning on port 3000");
});
