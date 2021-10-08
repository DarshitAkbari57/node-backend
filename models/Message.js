const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    roomId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'room'
    },
    senderId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    message:{
        type: String,
        required: true,
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    delivered: {
        type: Boolean,
        default: false
    },
    seen: {
        type: Boolean,
        default: false
    }
},{strict:false});

module.exports = Message = mongoose.model('message',MessageSchema);