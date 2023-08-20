//jshint esversion:6

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import _ from "lodash";

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://billasujith77:Praveen17@cluster0.iqzj7rl.mongodb.net/todolistDB"
);

const itemsSchema = mongoose.Schema({
  name: String,
});

const Item = new mongoose.model("Item", itemsSchema);
const item1 = new Item({
  name: "Welcome to the ToDo list",
});
const item2 = new Item({
  name: "Click on + to add a new item",
});
const item3 = new Item({
  name: "<---- Hit this to mark an item as done",
});
const defaultItems = [item1, item2, item3];
const listSchema = mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}).then((data) => {
    if (data.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: data });
    }
  });
});

app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({ name: customListName }).then((foundList) => {
    if (!foundList) {
      //Create a new list
      const list = new List({
        name: customListName,
        items: defaultItems,
      });
      list.save();
      res.redirect("/" + customListName);
    } else {
      //Display existing list
      res.render("list", {
        listTitle: foundList.name,
        newListItems: foundList.items,
      });
    }
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }).then((foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
      .then(() => {
        console.log("Removed successfully!!!");
      })
      .catch((err) => {
        console.log(err);
      });
    res.redirect("/");
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } }
    ).then(() => {
      res.redirect("/" + listName);
    });
  }
});

app.get("/work", (req, res) => {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
