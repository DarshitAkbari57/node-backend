const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require("config");

const Message = require('../../models/Message');
const Room = require('../../models/Room');
const User = require('../../models/User');


// @route   GET api/room
// @desc    get user's all room
// @access   Private
router.get('/:roomId/:startsFrom/:records',[auth],async (req,res)=>{
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
    try{
        // const {roomId} = req.body;
        const {roomId,startsFrom, records} = req.params;

        let messages = await Message.find({roomId}).sort('created_at').skip(parseInt(startsFrom)).limit(parseInt(records))
                            .populate('senderId','first_name last_name email socketId')
                            .populate('receiverId','first_name last_name email socketId')
                            .populate("roomId");

        let room = await Room.findById(roomId);
        
        const updateRoomBody = {
            unreadCount1: room.user1.toString()==req.user._id ? 0 : room.unreadCount1,
            unreadCount2: room.user2.toString()==req.user._id ? 0 : room.unreadCount2,
        }
        
        await Room.findByIdAndUpdate(roomId, updateRoomBody)
                            
        return res.status(200).send({
            success:true,
            message:"",
            data:messages
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


// @route   post api/message/send
// @desc    create new College
// @access   Private
router.post('/send',[
    auth,
    [
        check('roomId','roomId is required').exists(), 
        check('receiverId','receiverId is required').exists(), 
        check('message','message is required').exists(), 
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

            const { roomId, receiverId, message} = req.body;
            const receiver = await User.findById(receiverId).select("-password");
            // if(!(room.user1==req.user._id || room.user2==req.user._id))
            // {
            // return res.status(400).json({
            //     success:false,
            //     message:"UNAUTHORIZED",
            //     data:""});
            // }
            
            let messageBody = {
                roomId,
                senderId:req.user._id,
                receiverId,
                message,
                createdAt: Date.now()
            }
            
            let room = await Room.findById(roomId);
            console.log(room.user1.toString()==req.user._id.toString(),room.user2.toString()==req.user._id.toString(),room.user1,room.user2,req.user._id)
            
            const roomUpdateBody = {         
                lastMessage:message,
                totalMessages:room.totalMessages+1,
                unreadCount1: room.user2.toString()==req.user._id ? room.unreadCount1+1 : room.unreadCount1,
                unreadCount2: room.user1.toString()==req.user._id ? room.unreadCount2+1 : room.unreadCount2,
            }
            
            let messages = new Message(messageBody);

           await messages.save();

           const room1= await Room.findByIdAndUpdate(roomId,roomUpdateBody);
           console.log(room1);

           req.io.to(receiver.socketId).emit("message",JSON.stringify(messageBody));

           messages = await Message.findById(messages._id).populate("roomId")
                                .populate("senderId","-password")
                                .populate("receiverId","-password");

            res.status(200).send({
                success:true,
                message:"",
                data:messages
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

// @route   DELETE api/message/delete
// @desc    delete message
// @access   Private
router.delete('/delete',[
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

        const message =await Message.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:message
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