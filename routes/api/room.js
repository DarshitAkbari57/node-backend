const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require("config");
const mongoose = require('mongoose');

const Room = require('../../models/Room');

// @route   GET api/room
// @desc    get user's all room
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
        let room = await Room.find({
            $or:[
                {
                    user1:req.user._id
                },
                {
                    user2:req.user._id
                }
            ]
        }).populate('user1','-password').populate('user2','-password');
        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:room
        }); 
}
    catch(err){
        console.log(err.message);
        res.status(500).send({
            success:false,
            message:err.message,
            data:""
        });
    }
});

// @route   post api/room/create
// @desc    create new room
// @access   Private
router.post('/create',[auth,[
    check("userId",'receiver id is required')
]], async (req,res)=>{

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

        const {userId} = req.body;
        console.log(userId)
        let room = await Room.findOne({
            $or:[
                {
                    $and:[
                        {
                            user1:req.user._id
                        },
                        {
                            user2:userId
                        }
                    ]
                },
                {
                    $and:[
                        {
                            user1:userId
                        },
                        {
                            user2:req.user._id
                        }
                    ]
                }
            ]
        }).populate('user1','-password').populate('user2','-password');
        console.log("room",room)
        if(room===null){
            room = new Room({
                user1:req.user._id,
                user2:userId
            });
            console.log(room)
            await room.save();
            room = await Room.findById(room._id).populate('user1','-password').populate('user2','-password');
        }

        res.status(200).send({
            success:true,
            message:"",
            data:room
        });
        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }
});

// @route   DELETE api/room/delete
// @desc    delete user's room
// @access   Private
router.post('/delete',[
    auth,[
        check('id','Id of Room is required').exists()
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

        const room =await Room.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:room
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
