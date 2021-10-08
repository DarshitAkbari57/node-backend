const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require("config");

const User = require('../../models/User');
const Itinerary = require('../../models/Itinerary');
const ItineraryDetails = require('../../models/ItineraryDetails');
const RecentAction = require('../../models/RecentAction');


// @route   GET api/itinerary
// @desc    get user's itinerary
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
        const {type} = req.user;
        console.log(type)
        switch(type)
        {
            case "agent":{
                const itinerary = await Itinerary.find({userId:req.user._id}).populate("agencyId").populate("collegeId").populate("userId");
            
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:itinerary
                });
                
            }  
            
            case "agency":{
                const itinerary = await Itinerary.find({agencyId:req.user.agencyId}).populate("agencyId").populate("userId").populate("collegeId");
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:itinerary
                });
            }

            case "admin":{
                const itinerary = await Itinerary.find({}).populate("agencyId").populate("userId").populate("collegeId");
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:itinerary
                });
            }

            default:{
                const itinerary = await Itinerary.find({ collegeId:req.user.collegeId}).populate("collegeId");
                // const {socketId} = req.user;

                // req.io.to(socketId).emit("message","we are getting itinerary data");
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:itinerary
                }); 
            }
        }
        // res.io.emit("message","Hey!")
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            success:false,
            message:err.message,
            data:""
        });
    }
});

// @route   GET api/itinerary/:id
// @desc    get user's itinerary
// @access   Private
router.get('/:id',auth,async (req,res)=>{
    try{

        const {id} = req.params;

        const itinerary = await Itinerary.findById(id).populate('collegeId').populate("userId","-password").populate("agencyId")
        
        return res.status(200).send({
            success:true,
            message:"",
            data:itinerary
        }); 
        
    }
    catch(err){
        console.log(err);
        res.status(500).send({
            success:false,
            message:err.message,
            data:""
        });
    }
});

// @route   post api/itinerary/create
// @desc    create new itinerary
// @access   Private
router.post('/create',[
    auth,
    [
        check('name','Name is required').exists(),
        check('description','Description is required').exists(),
    ]],
    async (req,res) => {

        try {
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                console.log(errors)
                return res.status(400).json({
                success:false,
                message:errors,
                data:""
            });
            }

            const { name,tourId, description, tAndc, qa, transport, month, price, duration, destination, exclusive=[], coverPhoto, place=[], days=[], accomodation = [] } = req.body;

            const newItinerary = new Itinerary({
                name,
                description,
                userId: req.user._id,
                agencyId:req.user.agencyId,
                month,
                price,
                tourId,
                duration,
                destination,
                exclusive, 
                coverPhoto,
                place,
                days,
                accomodation,
                tAndc,
                transport,
                qa
            });

            await newItinerary.save();
            console.log(newItinerary._id)

           // const itinerary = await Itinerary.findOne().sort('-created_at');

        //    const recentActionBody = {
        //     userId:req.user._id,
        //     agnecyId:req.user.agencyId._id,
        //     action:`${user.first_name} ${user.last_name} create new Itinerary as ${name}`
        // }

        // const newRecentAction = new RecentAction(recentActionBody);

        //await newRecentAction.save();

            res.status(200).send({
                success:true,
                message:"",
                data:newItinerary
            });

        } catch (error) {
            console.log(error)
            res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
        }
        
    }
);

// @route   PUT api/itinerary/update
// @desc    update user's itinerary
// @access   Private
router.put('/update',[
    auth,
    [
        check('id','ID of itinerary is required').exists()
    ]],
    async (req,res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            console.log(errors)
            return res.status(400).json({
            success:false,
            message:errors,
            data:""
        });
        }
        try {
            const { id, name,
                tourId,
                tAndc,
                transport,
                qa,
                 description, status, month, duration, price, coverPhoto, place, exclusive, accomodation, days } = req.body;
            
            const itinerary = await Itinerary.findById(id);

            const updateItineraryBody = {
                name: name ? name : itinerary.name,
                description: description ? description : itinerary.description,
                status: status ? status : itinerary.status,
                userId: req.user._id,
                month: month ? month : itinerary.month,
                duration: duration ? duration : itinerary.duration,
                price: price ? price : itinerary.price,
                coverPhoto: coverPhoto ? coverPhoto : itinerary.coverPhoto,
                place: place ? place : itinerary.place,
                exclusive : exclusive ? exclusive : itinerary.exclusive,
                accomodation : accomodation ? accomodation : itinerary.accomodation,
                days : days ? days : itinerary.days,
                tourId : tourId ? tourId : itinerary.tourId,
                accomodation : accomodation ? accomodation : itinerary.accomodation,
                tAndc: tAndc ? tAndc : itinerary.tAndc,
                transport : transport ? transport : itinerary.transport,
                qa: qa ? qa : itinerary.qa,
            };

            await Itinerary.findByIdAndUpdate(id,updateItineraryBody);
            
            const updatedItinerary = await Itinerary.findById(id);

            res.status(200).send({
                success:true,
                message:"",
                data:updatedItinerary
            });

        } catch (error) {
            console.log(error)
            res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
        }
        
    }
);

// @route   DELETE api/itinerary
// @desc    delete user's itinerary
// @access   Private
router.delete('/delete',[
    auth,[
        check('id','Id of itinerary is required').exists()
    ]
],
async (req,res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        console.log(errors)
        return res.status(400).json({
        success:false,
        message:errors,
        data:""
    });
    }
    try {
        const {id} = req.body;

        const itinerary =await Itinerary.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:itinerary
        });

    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }

});

// @route   PUT api/itinerary/update
// @desc    update user's itinerary
// @access   Private
router.post('/join',[
    auth,
    [
        check('id','ID of itinerary is required').exists()
    ]],
    async (req,res) => {

        const errors = validationResult(req);
        if(!errors.isEmpty())
        {
            console.log(errors)
            return res.status(400).json({
            success:false,
            message:errors,
            data:""
        });
        }
        const {id} = req.body;
        let itinerary,msg;
        try {

            if(req.user.type==="student")
            {
                const updateStudentBody= {
                    userId:req.user._id,
                    payment:"student pay"
                }

                itinerary = await Itinerary.findById(id);

                const students = itinerary.students;

                if(students.filters((p)=>p.userId===req.user._id).length===0)
                {
                    await Itinerary.findByIdAndUpdate(
                        id,
                        {$push: {"students": updateStudentBody}},
                        {safe: true, upsert: true, new : true}
                    );
    
                    itinerary = await Itinerary.findById(id);
                }
            }
            else{
                const updateStudentBody= {
                    userId:req.user._id,
                    payment:"student pay"
                }

                itinerary = await Itinerary.findById(id);

                const professors = itinerary.professors;
                
                professors.filter()
                if(professors.length===0 || professors.filter((p)=>p.userId===req.user._id).length===0)
                {
                    await Itinerary.findByIdAndUpdate(
                        id,
                        {$push: {"professors": updateStudentBody}},
                        {safe: true, upsert: true, new : true}
                    );
    
                    itinerary = await Itinerary.findById(id);
                }
                
            }

            res.status(200).send({
                success:true,
                message:"",
                data:itinerary
            });

        } catch (error) {
            res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
        }
        
    }
);

module.exports = router;