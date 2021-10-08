const mongoose = require('mongoose');

const RecentActionSchema = mongoose.Schema({
    action:{
        type: String,
        required: true,
    },
    collegeId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'college'
    },
    agencyId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'agency'
    },
    created_at:{
        type:Date,
        default:Date.now,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
});

module.exports = RecentAction = mongoose.model('recent_action',RecentActionSchema);