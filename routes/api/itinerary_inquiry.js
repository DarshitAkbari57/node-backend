const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const config = require("config");
const sgMail = require('@sendgrid/mail');

const User = require('../../models/User');
const ItineraryInquiry = require('../../models/ItineraryInquiry');
const Notification = require('../../models/Notification');
const RecentAction = require('../../models/RecentAction');

// @route   GET api/inquiry
// @desc    get inquiry details role wise
// @access   Private
router.get('/',[auth,
],async (req,res)=>{

    const errors = validationResult(req);
    if(!errors.isEmpty())
    {
        console.log(errors)
        return res.status(400).json({
            success:false,
            message:errors.message,
            data:""
        });
    }

    try{
        const {type} = req.user;

        // switch(type){
        
        // }
        switch(type){
            case "college":{
                const inquiry = await  ItineraryInquiry.find({userId:req.user._id})
                                .populate('agents.userId',"-password")
                                .populate('agents.itineraryId')
                                .populate('userId',"-password");

                return res.status(200).send({
                    success:true,
                    message:"",
                    data:inquiry
                });
            }

            case "admin":{
                const inquiry = await ItineraryInquiry.find({})
                                .populate('agents.userId',"-password")
                                .populate('agents.itineraryId')
                                .populate('userId',"-password");

                return res.status(200).send({
                success:true,
                message:"",
                data:inquiry
                });
            }

            case "agency":
            case "agent":{
                const inquiry =await ItineraryInquiry.find({"agents.agencyId":req.user.agencyId})
                                .populate('agents.userId',"-password")
                                .populate('agents.itineraryId')
                                .populate('userId',"-password");

                return res.status(200).send({
                success:true,
                message:"",
                data:inquiry
                });
            }
        }
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

// @route   GET api/inquiry/:id
// @desc    get inquiry details role wise
// @access   Private
router.get('/:id',auth,async (req,res)=>{

    try{
        const {id} = req.params;
        console.log(id)
        const inquiry = await ItineraryInquiry.findById(id)
                            .populate('agents.userId',"-password")
                            .populate('agents.itineraryId')
                            .populate('userId',"-password");

        return res.status(200).send({
            success:true,
            message:"",
            data:inquiry
        })
        
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

// @route   post api/inquiry/create
// @desc    create new Inquiry
// @access   Private
router.post('/create',[
    auth,
    [
        check('name','name is required').exists(),
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

            const { name, description, budget, duration, students, month } = req.body;
            console.log(req.user)

            const inquiry = new ItineraryInquiry({
                name,
                description,
                userId: req.user._id,
                duration,
                month,
                budget,
                students,
                collegeId: req.user.collegeId._id
            });

            await inquiry.save();

            const recentActionBody = {
                userId:req.user._id,
                collegeId:req.user.collegeId._id,
                action:`${req.user.first_name} ${req.user.last_name} created new inuiry as ${name}`
            }

            const newRecentAction = new RecentAction(recentActionBody);

            await newRecentAction.save();

            res.status(200).send({
                success:true,
                message:"",
                data:inquiry
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


// @route   post api/inquiry/invite
// @desc    invite agents
// @access   Private
router.post('/invite',[
    auth,
    [
        check('agents','Agnet list is required').exists(),
        check('id','ID of inquiry is required').exists()
    ]],
    async (req,res) => {

        try {
            const {socketId} = req.user;
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

            const { id, agents } = req.body
            let inquiry = await  ItineraryInquiry.findById(id);
            const agentsList = inquiry.agents
            for(i in agents){
                if(agentsList===undefined || agentsList.filter((a)=>a.agencyId==agents[i]).length===0)
                {
                    const agency = await Agency.findById(agents[i]);
                    const data = { agencyId:agents[i],userId:agency.userId}
                    await ItineraryInquiry.findByIdAndUpdate(
                        id,
                        {$push: {"agents": data}},
                        {safe: true, upsert: true, new : true}
                    );
                    console.log(agents[i])
                    const agentsData = await Agency.findById(agents[i]).populate('userId');
                    agentSocketId = agentsData.socketId;

                    const notificationObject = {
                        message: `${req.user.first_name} sent you an inquiry for a trip named as ${inquiry.name}`,
                         type:"inquiry",
                         agencyId:agentsData.userId.agencyId,
                         userId: agentsData.userId._id,
                         createdBy: req.user._id
                     }
                    const newNotification = new Notification(notificationObject);

                    req.io.to(agentSocketId).emit("notification",JSON.stringify(notificationObject));
                    
                    await newNotification.save();

                    sgMail.setApiKey(config.
                        get("sendGridApiKey"));
                    const msg = {
                        to: agentsData.userId.email,
                        from: "workforsmit@gmail.com",
                        templateId: 'd-56bb862671114fc2b0e3ace7f97a740a',
                        dynamicTemplateData: {
                            first_name:req.user.first_name,
                            last_name:req.user.last_name,
                            name:inquiry.name 
                        },
                    };
                    await sgMail.send(msg);

                    inquiry = await ItineraryInquiry.findById(id);
                }
            }
            


            res.status(200).send({
                success:true,
                message:"",
                data:inquiry
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

// @route   PUT api/inquiry/submit
// @desc    update user's itinerary
// @access   Private
router.put('/submit',[
    auth,
    [
        check('id','ID of inquiry is required').exists(),
        check('itineraryId','ID of itinerary is required').exists()
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

            const {id,itineraryId} = req.body;

            const itinerary = await Itinerary.findById(itineraryId)
            const data = {
                status:"submitted",
                itineraryId:itineraryId,
                userId:req.user._id,
                agencyId:req.user.agencyId
            }
            console.log(data)
            let inquiry = await ItineraryInquiry.findOneAndUpdate({_id:id,'agents.agencyId':req.user.agencyId},
                            {$set:{'agents.$':data}});
            console.log(inquiry)
            inquiry = await ItineraryInquiry.findById(id);

            res.status(200).send({
                success:true,
                message:"",
                data:inquiry
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

// @route   PUT api/inquiry/update
// @desc    update user's itinerary
// @access   Private
router.put('/decline',[
    auth,
    [
        check('id','ID of inquiry is required').exists(),
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

            const {id} = req.body;

            let inquiry = await ItineraryInquiry.findById(id).populate('itineraryId');
            let agents = inquiry.agents;
            agents = agents.filter((a)=>a.userId.toString()!=req.user._id.toString());
            console.log(agents)
            inquiry = await ItineraryInquiry.findByIdAndUpdate(id,{agents:agents});
            inquiry = await ItineraryInquiry.findById(id);

            res.status(200).send({
                success:true,
                message:"",
                data:inquiry
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

// @route   PUT api/inquiry/approve
// @desc    update user's itinerary
// @access   Private
router.put('/approve',[
    auth,
    [
        check('id','ID of inquiry is required').exists(),
        check('itineraryId','ID of itinerary is required').exists()
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

            const {id,itineraryId} = req.body;
            const {collegeId} = req.user;

            let itinerary = await Itinerary.findById(itineraryId);

            const data = {
                is_completed:true,
                collegeId:collegeId,
                itineraryId:itineraryId,
                userId:itinerary.userId,
                agencyId:itinerary.agencyId
            }
            console.log("data",data)

            inquiry = await ItineraryInquiry.findOneAndUpdate({_id:id,'agents.itineraryId':itineraryId},
                            {
                                $set:{'agents.$':data},
                                is_completed:true,
                                approvedAgency: itinerary.agencyId
                            });
            //console.log(inquiry)

            itinerary = await Itinerary.findByIdAndUpdate(itineraryId,{collegeId})

            inquiry = await ItineraryInquiry.findById(id).populate('agents.itineraryId');

            res.status(200).send({
                success:true,
                message:"",
                data:inquiry
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


// @route   DELETE api/itinerary
// @desc    delete user's itinerary
// @access   Private
router.delete('/delete',[
    auth,[
        check('id','Id of inquiry is required').exists()
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

        const inquiry =await ItineraryInquiry.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:inquiry
        });

    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }

});


module.exports = router;