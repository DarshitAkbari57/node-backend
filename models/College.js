const mongoose = require('mongoose');

const CollegeSchema = mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    email:{
        type:String,
        // required:true,
        // unique:true,
    },
    address: {
        type: Object,
        default: { city: null, state: null, street: null, zip: null, country:"India" }
    },
    phone: {
        type: String
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    }
});

module.exports = College = mongoose.model('college',CollegeSchema);