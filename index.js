const express = require("express")
const bodyParser = require("body-parser")
// var items=["Buy Food", "Cook Food", "Eat Food"]
// var workItems=[]
const mongoose = require("mongoose")
mongoose.connect("mongodb://localhost:27017/To-Do-List")

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("item",itemsSchema)

const item1 = new Item({
    name: "Car"
})
const item2 = new Item({
    name: "Bus"
})
const item3 = new Item({
    name: "Transformer"
})
const defaultItems = [item1,item2,item3]

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(__dirname))

app.get("/",function(req,res){
    Item.find({}, function(err, itemList){
        if(itemList.length===0){
            Item.insertMany(defaultItems,function(err){
                if(err){
                    console.log(err)
                }else{
                    console.log("Success")
                    res.redirect("/")
                }
            })
        }else{
            res.render("index",{kindOfDay: "Today", newListItems: itemList})   
        }
    })
    var today = new Date()
    var options={
        weekday: "long",
        day: "numeric",
        month: "long"
    }
    var day = today.toLocaleDateString("en-us",options)
})

app.post("/",function(req,res){
    
    const itemName = req.body.newItems
    const listname = req.body.button

    const item = new Item({
        name:itemName
    })
    if(listname === "Today"){
        item.save()
        res.redirect("/")
    }else{
        List.findOne({name: listname}, function(err, foundList){
            foundList.itemName.push(item)
            foundList.save()
            res.redirect("/"+listname)
        })
    }
    
    // if(req.body.button==="Work"){
    //     workItems.push(item)
    //     res.redirect("/work")
    // }else{
    //     items.push(item)
    //     res.redirect("/")
    // }
})

app.post("/delete",function(req,res){
    const checkedItemId = (req.body.checkbox)
    const listName = req.body.listName
    
    if(listName === "Today"){
        Item.findByIdAndRemove(checkedItemId, function(err){
            console.log(err)
            res.redirect("/")
        }) 
    }else{
        List.findOneAndUpdate({name: listName},{$pull: {itemName: {id: checkedItemId}}}, function(err,foundList){
            if(!err){
                res.redirect("/"+listName)
            }else{
                console.log(err)
            }
        })
    }
})

const listSchema = new mongoose.Schema({
    name: String,
    itemName: [itemsSchema]
})
const List = mongoose.model("list",listSchema)

app.get("/:list",function(req,res){
    const customListName = req.params.list
    List.findOne({name: customListName}, function(err,listName){
        if(!listName){
            const list = new List({
                name: customListName,
                itemName: defaultItems  
            })
            list.save()
            res.redirect("/"+customListName)
        }else{
            res.render("index",{kindOfDay: listName.name, newListItems: listName.itemName})
        }
    })
})

// app.get("/work", function(req,res){
//     res.render("index", {kindOfDay: "Work", newListItems: workItems})
// })

// app.post("/work", function(req,res){
//     let item = req.body.newItems
//     workItems.push(item)
//     res.redirect("/work")
// })


app.listen(3000, function(){
    console.log("Server 3000")
}) 