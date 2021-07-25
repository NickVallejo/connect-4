const mongoose = require("mongoose")

const Player = mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    points: {
        type: Number,
        required: true,
        default: 0
    }
})

module.exports = Player