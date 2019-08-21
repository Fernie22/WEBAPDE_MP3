const mongoose = require("mongoose")

const n = require("./user.js")

let User = mongoose.model("user", {
    username : String,
    password : String
})

module.exports = {
    User
}
