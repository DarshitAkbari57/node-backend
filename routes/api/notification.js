const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require("config");
const server = require('server');
const { get, socket } = server.router;

const User = require('../../models/User');
const Notification = require('../../models/Notification');


// @route   GET api/notification
// @desc    get user's notification
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
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

        const notification = await Notification.find({userId:req.user._id}).populate('userId','-password');

        // req.io.to(socketId).emit("message","notification got")

        res.status(200).send({
            success:true,
            message:"",
            data:notification
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

// @route   post api/notification/create
// @desc    create new notification
// @access   Private
router.post('/create',[
    auth,
    [
        check('message','message is required').exists(),
        check('type','type is required').exists(),
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

            const { message, type } = req.body;

            const newNotification = new Notification({
                message,
                type,
                userId: req.user._id
            });
            
            await newNotification.save();
            const notification = await Notification.findOne().sort('-created_at').limit(1).populate('userId','-password');
            
            res.status(200).send({
                success:true,
                message:"",
                data:notification
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

// @route   PUT api/notification/update
// @desc    update user's notification
// @access   Private
router.put('/update',[
    auth,
    [
        check('id','ID of notification is required').exists()
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
            const { id, message, type } = req.body;
            
            const notification = await Notification.findById(id);

            const updateNotificationBody = {
                message: message?message:notification.message,
                type: type?type:notification.type,
                userId: req.user._id
            };

            await Notification.findByIdAndUpdate(id,updateNotificationBody);
            
            const updateNotification = await Notification.findById(id).populate('userId','-password');

            res.status(200).send({
                success:true,
                message:"",
                data:updateNotification
            });

        } catch (error) {
            res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
        }
        
    }
]);

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

        const notification =await (await Notification.findByIdAndRemove(id)).populated('userId','-password');
        
        res.status(200).json({
            success:true,
            message:"",
            data:notification
        });

    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }

})
module.exports = router;