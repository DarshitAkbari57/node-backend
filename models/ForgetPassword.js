const mongoose = require('mongoose');

const ForgetPasswordSchema = mongoose.Schema({
    linkId:{
        type: String,
        required: true,
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    }
});

module.exports = ForgetPassword = mongoose.model('forget_password',ForgetPasswordSchema);