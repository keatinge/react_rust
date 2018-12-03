const express = require("express");
const rust = require("./rustwiki");

let app = express();


let items;
rust.getItems().then(i => items = i);


var allowCrossOrigin = function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
};
app.use(allowCrossOrigin);


app.get("/", function (req, res){
   res.json({"Hello" : "Hi"});
});

app.get("/items", function (req, res){
    console.log("req");
    res.json(items);
});


app.get("/getItem", function (req, res) {
    console.log(req.query.name);
    rust.getItemByName(req.query.name)
        .then((info) => res.json(info));
});

app.listen(8888, "0.0.0.0", function (){
    console.log("starting server...");
});



