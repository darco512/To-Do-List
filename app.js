const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.set('strictQuery', false);
mongoose.connect("mongodb://127.0.0.1:27017/todolistDB")

const todoSchema = {
    name: String
};

const Todo = mongoose.model("todo", todoSchema);

const buyFood = new Todo({
    name: "Welcome to your todolist"
});
const cookFood = new Todo({
    name: "Hit the + to add a new item."
});
const eatFood = new Todo({
    name: "<--- Hit this to delete an item."
});

const defaultItems = [buyFood, cookFood,eatFood];

const listSchema= {
    name: String,
    items:[todoSchema]
};

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res){
     
    Todo.find({},function(err,items){ 
        if(items.length===0){Todo.insertMany(defaultItems,function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Successfully added default To Do list!");  
            }
        });
        res.redirect("/");
    }else{
        res.render("list",{listTitle: "Today", newListItem: items});
    }
    })

    

});

app.get("/:customListName", function(req, res){
    if (req.params.name != "favicon.ico") {
        const name = _.capitalize(req.params.name);
    const customListName = _.capitalize(req.params.customListName);

        List.findOne({name: customListName}, function(err, foundList){
            if(!err){
                if(!foundList){
                    const list = new List({
                        name: customListName,
                        items: defaultItems
                });
                    list.save(function(){
                        res.redirect("/"+customListName);
                    });
                    
                }else{
                    res.render("list", {listTitle: foundList.name, newListItem: foundList.items})
                }
            }
        })

    }

});


app.post("/", function(req,res){
    const itemName = req.body.addList;
    const listName= req.body.list;

        const todo = new Todo({
            name : itemName
        })

        if(listName === "Today"){
            todo.save();
            res.redirect("/");
        }else{
            List.findOne({name: listName}, function(err,foundList){
                foundList.items.push(todo);
                foundList.save();
                res.redirect("/"+ listName);
            })
        }
        
});

app.post("/delete",function(req,res){
    const checkedItemId = req.body.checkbox;
    const listName =  req.body.listName;

    if(listName==="Today"){
        Todo.findByIdAndRemove(checkedItemId, function(err){
            if(!err){
                res.redirect("/");
            }
        })
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {items:{_id: checkedItemId}}},function(err,foundList){
            if(!err){
                res.redirect("/"+ listName);
            }
        })
    }
    
}); 


app.get("/about", function(req,res){
    res.render("about");
});

app.listen(3000, function(req,res){
    console.log("Server started on port 3000");
});