const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    message:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        required: true,
    },
    created_at:{
        type:Date,
        default:Date.now,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    collegeId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'college'
    },
    agencyId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'agency'
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },

});

module.exports = Notification = mongoose.model('notification',NotificationSchema);