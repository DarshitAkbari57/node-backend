const mongoose = require('mongoose');

const RoomSchema = mongoose.Schema({
    user1:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    user2:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    lastMessage:{
        type:String
    },
    totalMessages:{
        type:Number,
        default:0
    },
    unreadCount1:{
        type:Number,
        default:0
    },
    unreadCount2:{
        type:Number,
        default:0
    }
},{strict:false});

module.exports = Room = mongoose.model('room',RoomSchema);