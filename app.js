const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ =require("lodash");
const app=express();

app.set('view engine','ejs');

mongoose.connect("mongodb+srv://abbaszaidi:abbaszaidi@cluster0.dz6w3ly.mongodb.net/TO-DO LIST?retryWrites=true&w=majority",{useNewUrlParser:true});

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));
const itemsSchema={
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item1=new Item({
  name:"Welcome to your todoList !"
});
const item2=new Item({
  name:"Hit the + button to add a new item."
});
const item3=new Item({
  name:"<---Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const ListSchema={
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List",ListSchema);

// var items=['Buy Food','Cook Food','Eat Food'];
// var workItems=[];

app.get("/",function(req,res){
  Item.find({},function(err,foundItems){
    if (foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully saved default items to DB");
        }
      })
    }
    else{
      res.render("list",{listTitle:"Today",item:foundItems});//replacing the array with a collection

    }
  });
});
app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //create a new list !
        const list=new List({
          name:customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      }else{
        //show an existing list
        res.render("list",{listTitle: foundList.name, item: foundList.items});
      }
    }
  })
});

app.post("/",function(req,res){

  var itemName = req.body.newItem;
  var listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName); //redirects you to the same list you added the item to
    })
  }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Sucessfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name: listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

});



app.get("/about",function(req,res){
  res.render("about");
});

app.listen(3000,function(){
  console.log("Server is running on port 3000");
});
