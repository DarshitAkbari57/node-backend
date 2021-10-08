const mongoose = require('mongoose');

const ItineraryDetailsSchema = mongoose.Schema({
    itineraryId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'itinerary'
    },
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    payment:{
        type:String
    }, 
    details:[
        {
            paymentId:{
                type:String
            },
            paymentDate:{
                type:Date,
            },
            amount:{
                type:Number
            },
            dueDate:{
                type:Date
            }
        }
    ],
    type:{
        type:String
    },
    emiValue:{
        type:Number
    }
    
});

module.exports = ItineraryDetails = mongoose.model('itinerary_details',ItineraryDetailsSchema);