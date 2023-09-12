//jshint esversion:6
const mongoose = require("mongoose");

const express = require("express");
const bodyParser = require("body-parser");
const { ConnectionReadyEvent } = require("mongodb");
const date = require(__dirname + "/date.js");
const _ = require("lodash");

const app = express();
mongoose.connect(
  "mongodb+srv://abbaszaidi:12345@cluster0.omgkwaj.mongodb.net/todolistDB"
);

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const itemSchema = new mongoose.Schema({
  name: String,
});

const item = mongoose.model("item", itemSchema);
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});
const list = mongoose.model("list", listSchema);

const item1 = new item({
  name: "Welcome to your TodoList !",
});

const item2 = new item({
  name: "Hit the + button to add a new Item",
});

const item3 = new item({
  name: "<--- Hit this button to delete an item",
});
const defaultItem = [item1, item2, item3];
// item.insertMany(defaultItem);
app.get("/", function (req, res) {
  item
    .find()
    .then((itemsfound) => {
      if (itemsfound.length === 0) {
        item.insertMany(defaultItem);
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", newListItems: itemsfound });
      }
    })
    .catch((err) => {
      console.log(err);
    });
});
app.post("/", function (req, res) {
  if (req.body.list === "Today") {
    const g = new item({
      name: req.body.newItem,
    });
    g.save();
    res.redirect("/");
  } else {
    list
      .findOne({ name: req.body.list })
      .then((foundlist) => {
        const g = new item({
          name: req.body.newItem,
        });
        foundlist.items.push(g);
        foundlist.save();
        res.redirect("/" + req.body.list);
      })
      .catch((err) => {
        console.log(err);
      });
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.post("/delete", (req, res) => {
  //First we find the name of the list in which we want to delete the items
  list
    .findOne({ name: req.body.listname })
    .then((thefoundlist) => {
      //after finding the name of the list we find the index of the array in which the item which is to be deleted in located
      //then we use the array.splice method to delete it from the list
      //then redirect to that same list
      const found = thefoundlist.items.findIndex(
        (item) => item.id === req.body.checkbox
      );
      if (found > -1) {
        thefoundlist.items.splice(found, 1);
      } else {
        console.log("error");
      }
      if (thefoundlist.items.length === 0) {
        thefoundlist.items = defaultItem;
      }
      thefoundlist.save();
      res.redirect("/" + req.body.listname);
    })

    .catch((err) => {
      console.log("error", err);
    });
});
app.get("/:paramName", (req, res) => {
  var customListName = req.params.paramName;
  var lodaash = _.capitalize(customListName);
  // customListName = lodaash;
  list
    .findOne({ name: customListName })
    .then((result) => {
      if (result) {
        res.render("list.ejs", {
          listTitle: customListName,
          newListItems: result.items,
        });
      } else {
        const list1 = new list({
          name: customListName,
          items: defaultItem,
        });
        list1.save();
        res.redirect("/" + customListName);
      }
    })
    .catch((err) => {
      console.log("Error", err);
    });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
