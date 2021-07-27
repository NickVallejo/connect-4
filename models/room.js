const mongoose = require("mongoose")

const Room = mongoose.Schema({
    roomUrl: {
        type: String,
        required: true
    },
    inviteUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Players',
        required: true
    },
    createdAt: { 
        type: Date, 
        expires: 60*60*24,
        default: Date.now }
})

module.exports = Room