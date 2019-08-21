const express = require("express")
const bodyparser = require("body-parser")
const session = require("express-session")
const cookieparser = require("cookie-parser")
const mongoose = require("mongoose")

const {User} = require("./user.js")
const {Bookmark} = require("./bookmark.js")

const app = express()

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost:27017/mp2", {
    useNewUrlParser : true 
})

const urlencoder = bodyparser.urlencoded({
    extended:false
})

app.use(express.static(__dirname + "/public"))
app.use(session({
    secret : "secret name",
    name : "chocolate cookie",
    resave : true,
    saveUninitialized : true,
    cookie:{
        maxAge : 1000*60*60*24*365
}
}))

app.use(cookieparser())

app.get("/", (req, res)=>{
    /*
    if(req.session.view){
        req.session.view++
    }
    else{
        req.session.view = 1
    }
    */
    if(req.session.username && req.session._id){
        res.render("dashboard.hbs",{
            username : req.session.username,
            userid : req.session._id
        })
    }
    else{
        res.sendFile(__dirname + "/public/login.html")
    }
    //res.send("Views " + req.session.view)
})

app.post("/login", urlencoder, (req, res)=>{
    let username = req.body.un
    let password = req.body.pw
/*    req.session.username = username
    res.redirect("/") */
    
    User.findOne({
        username : username,
        password : password
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else if(!doc){
            res.send("User does not exist!")
        }
        else{
            console.log(doc)
            req.session.username = doc.username
            req.session._id = doc._id
            res.redirect("/dashboard")
            
        }
    })
})

app.post("/register", urlencoder, (req, res)=>{
  let username = req.body.un
  let password = req.body.pw
  
  let user = new User({
      //if same name
      /*
      username,
      password
      */
      username : username,
      password : password
  })
  
  user.save().then((doc)=>{
      //if operation goes well
      console.log(doc)
      req.session.username = doc.username
      req.session._id = doc._id
      res.redirect("/")
  },(err)=>{
      //if operation goes wrong
      res.send(err)
  })
})

app.get("/dashboard", (req, res)=>{
    Bookmark.find({}, (err, docs)=>{
        if(err){
            res.send(err)
        }
        else if(req.session.username && req.session._id){
            res.render("dashboard.hbs",{
                username : req.session.username,
                userid : req.session._id,
                bookmarks:docs
            })
        }
    })
    
})

app.get("/users", (req, res)=>{
    User.find({}, (err, docs)=>{
        if(err){
            res.send(err)
        }
        else{
            res.render("admin.hbs",{
                users:docs
            })
        }
    })
})

// FOR USERS
app.get("/edit", (req, res)=>{
    //get user to be edited with id
    User.findOne({
        _id : req.query.id
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.render("edit.hbs",{
                user:doc
            })
        }
    })
})

app.get("/addpage", (req, res)=>{
    res.render("add.hbs")
})


app.post("/add", urlencoder, (req, res)=>{
    let username = req.body.un
    let password = req.body.pw
    
    let user = new User({
        username, password
    })
    user.save().then((doc)=>{
        res.redirect("/users")
    }, (err)=>{
        res.send(err)
    })
})

app.post("/delete", urlencoder, (req, res)=>{
    User.deleteOne({
        _id : req.body.id
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(doc)
        }
    })
})

app.post("/update", urlencoder, (req, res)=>{
    console.log("POST /update")
    User.update({
        _id : req.body.id
    }, {
        username : req.body.un,
        password : req.body.pw
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.redirect("/users")
        }
    })
})
//USERS UNTIL HERE

// FOR BOOKMARKS
app.get("/editbookmark", (req, res)=>{
    Bookmark.findOne({
        _id : req.query.id
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.render("editbookmark.hbs",{
                bookmark:doc
            })
        }
    })
})

app.get("/addbookmarkpage", (req, res)=>{
    if(req.session.username && req.session._id){
        res.render("addbookmark.hbs",{
            username : req.session.username,
            userid : req.session._id
        })
    }
    else{
        res.sendFile(__dirname + "/public/login.html")
    }
    //res.render("addbookmark.hbs")
})


app.post("/addbookmark", urlencoder, (req, res)=>{
    let title = req.body.title
    let link = req.body.link
    let comment = req.body.comment
    let metaimage = req.body.metaimage
    let ownerid = req.session._id
    let ownername = req.session.username
    
    
    let bookmark = new Bookmark({
        title, link, comment, metaimage, ownerid, ownername
    })
    bookmark.save().then((doc)=>{
        res.redirect("/dashboard")
    }, (err)=>{
        res.send(err)
    })
})

app.post("/deletebookmark", urlencoder, (req, res)=>{
    Bookmark.deleteOne({
        _id : req.body.id
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.send(doc)
        }
    })
})

app.post("/updatebookmark", urlencoder, (req, res)=>{
    console.log("POST /updatebookmark")
    Bookmark.update({
        _id : req.body.id
    }, {
        title : req.body.title,
        link : req.body.link,
        comment : req.body.comment,
        metaimage : req.body.metaimage
    }, (err, doc)=>{
        if(err){
            res.send(err)
        }
        else{
            res.redirect("/dashboard")
        }
    })
})
//USERS UNTIL HERE

app.get("/home", (req, res)=>{
    res.render("home.hbs")
})

app.listen(3000, ()=>{
    console.log("live at port 3000")
})