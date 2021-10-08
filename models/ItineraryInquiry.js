const mongoose = require('mongoose');

const ItineraryInquirySchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'user'
    },
    name:{
        type: String,
        required: true,
    },
    description:{
        type: String,
        required: true,
    },
    duration:{
        type: String,
    },
    month:{
        type: String,
    },
    students:{
        type: String,
    },
    budget:{
        type:String
    },
    is_completed:{
        type:Boolean,
        default:false
    },
    agents:[
        {
            userId:{
                type:mongoose.Schema.Types.ObjectID,
                ref: 'user'
            },
            status:{
                type:String,
                required:true,
                default:"pending"
            },
            itineraryId:{
                type:mongoose.Schema.Types.ObjectID,
                ref: 'itinerary'
            },
            agencyId:{
                type:mongoose.Schema.Types.ObjectID,
                ref: 'agencyId'
            },
            collegeId:{
                type:mongoose.Schema.Types.ObjectID,
                ref: 'college'
            },
        }
    ],
    collegeId:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'college'
    },
    approvedAgency:{
        type:mongoose.Schema.Types.ObjectID,
        ref: 'agency'
    }
});

module.exports = ItineraryInquiry = mongoose.model('itinerary_inquiry',ItineraryInquirySchema);``