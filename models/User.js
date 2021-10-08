const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    first_name:{
        type: String,
        required: true,
    },
    last_name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    type: {
        type: String,
    },
    avatar:{
        type:String,
    },
    bio:{
        type:String,
    },
    interest:[{
        type:String,
    }],
    address: {
        type: Object,
        default: { city: null, state: null, street: null, zip: null, country:"India" }
      },
    phone: {
    type: String
    },
    created_at:{
        type:Date,
        default:Date.now,
    },
    socketId:{
        type:String,
    },
    collegeId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'college'
    },
    agencyId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'agency'
    },
    verified: {
        type: Boolean,
        default: false
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    verificationToken:{
        type:String,
    },
    verificationCode:{
        type:String
    }
},{strict:false});

module.exports = User = mongoose.model('user',UserSchema);