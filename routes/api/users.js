const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const Itinerary = require('../../models/Itinerary');
const RecentAction = require('../../models/RecentAction');
const Notification = require('../../models/Notification');


// @route    GET api/users/dashboard
// @desc     dashboard Data
// @access   Public 
router.get('/dashboard',auth,
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        return res.status(400).json({errors:errors.array()});
    }

    try
    {
       const {type} = req.user;
       switch(type){
           case "agency":{
               const {agencyId} = req.user;
               console.log(agencyId)
               const userCount = await User.countDocuments({agencyId});
               const itineraryCount = await Itinerary.countDocuments({agencyId});
               const inquiryCount = await ItineraryInquiry.countDocuments({"agents.agencyId":agencyId});
               let recentAction = await Notification.find({agencyId}).populate('createdBy');
               recentAction = recentAction.map((r)=> {
                r = r.toJSON()
                console.log(r.createdBy.first_name)
                r.user=`${r.createdBy.first_name} ${r.createdBy.last_name}`;
                return r;
            });
               //console.log(recentAction)
                
                res.status(200).send({
                success:true,
                message:"",
                data:{userCount,itineraryCount,recentAction,inquiryCount}
            });
            break;
            }

            case "college":{
                const {collegeId} = req.user;
                const userCount = await User.countDocuments({collegeId});
                const itineraryCount = await Itinerary.countDocuments({collegeId});
                const inquiryCount = await  ItineraryInquiry.countDocuments({collegeId})

                let recentAction = await Notification.find({userId:req.user._id});
                recentAction = recentAction.map((r)=> {
                    r = r.toJSON()
                    console.log(r.createdBy.first_name)
                    r.user=`${r.createdBy.first_name} ${r.createdBy.last_name}`;
                    return r;
                });
 
                 res.status(200).send({
                 success:true,
                 message:"",
                 data:{userCount,itineraryCount,recentAction,inquiryCount}
             });
             break;
            }

            case "admin":{
               
                const userCount = await User.countDocuments({});
                const itineraryCount = await Itinerary.countDocuments({});
                const inquiryCount = await  ItineraryInquiry.countDocuments({})

                let recentAction = await Notification.find({}).populate('createdBy');
                recentAction = recentAction.map((r)=> {
                    r = r.toJSON()
                    console.log(r.createdBy.first_name)
                    r.user=`${r.createdBy.first_name} ${r.createdBy.last_name}`;
                    return r;
                });
                    console.log(recentAction)
 
                 res.status(200).send({
                 success:true,
                 message:"",
                 data:{userCount,itineraryCount,recentAction,inquiryCount}
             });
             break;
            }

       }
    
    }
    catch(err)
    {
        console.log(err.message);
        res.status(500).send('Server error');
    }
    
});

module.exports = router;