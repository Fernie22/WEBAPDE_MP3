const mongoose = require("mongoose")

const n = require("./bookmark.js")

let Bookmark = mongoose.model("bookmark", {
    title : String,
    link : String,
    comment : String,
    metaimage : String,
    ownerid : String,
    ownername : String
    
})

module.exports = {
    Bookmark
}