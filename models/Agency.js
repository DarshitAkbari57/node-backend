const mongoose = require('mongoose');

const AgencySchema = mongoose.Schema({
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
    logo:{
        type:String
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    }
});

module.exports = Agency = mongoose.model('agency',AgencySchema);