const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const User = require('../../models/User');
const ItineraryDetails = require('../../models/ItineraryDetails');

// @route   GET api/itinerarydetails/:id/
// @desc    get itinery passanger details
// @access   Private
router.get('/:id',[auth,
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
        const {id} = req.params;
        const itineraryDetails = await ItineraryDetails.findOne({itineraryId:id, userId:req.user._id})
                            .populate('itneraryId')
                            .populate('userId','-password')
                            .populate('itineraryId.collegeId');

        

        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:itineraryDetails
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

// @route   GET api/itinerarydetails/:id/
// @desc    get itinery passanger details
// @access   Private
router.get('/all/:id',[auth,
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
        const {id} = req.params;
        const itineraryDetails = await ItineraryDetails.find({itineraryId:id})
                            .populate('itneraryId')
                            .populate('userId','-password')
                            .populate('itineraryId.collegeId');

        

        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:itineraryDetails
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

// @route   GET api/itinerarydetails/:id/:type
// @desc    get itinery passanger details
// @access   Private
router.get('/:id/:type',[auth,
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
        const {id,type} = req.params;
        console.log(id,type)
        const itineraryDetails = await ItineraryDetails.findOne({itineraryId:id,type:type})
                            .populate('itneraryId')
                            .populate('userId','-password')
                            .populate('itineraryId.collegeId');

        

        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:itineraryDetails
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


// @route   POST api/itinerarydetails/join
// @desc    join user in list
// @access   Private
router.post('/join',[
    auth,
    [
        check('id','ID of itinerary is required').exists(),
        // check('payment','Payment staus is required').exists(),
        // check('paymentId','Payment id is required').exists(),
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
        const {id,type} = req.body;

        try {
            const user = await ItineraryDetails.findOne({userId:req.user._id,itineraryId:id});
            const itinerary = await Itinerary.findById(id);

            if(user!==null){
                return res.status(500).send({
                    success:false,
                    message:"You already joined the tour",
                    data:""
                });
            }
            let price;
            if(type=="emi"){
                price = Math.round(itinerary.price/6);
            }
            else{
                price = itinerary.price
            }

            let paymentDetails =[];
            for(i=0;i<6;i++){
                let date = new Date();
                paymentDetails.push({
                    dueDate:new Date(date.setMonth(date.getMonth()+i)),
                    amount:price
                })
            }
            console.log(paymentDetails)

            
            const details = new ItineraryDetails({
                itineraryId: id,
                userId: req.user._id,
                // payment: payment,
                // paymentId: paymentId,
                // paymentDate: Date.now(),
                type:req.user.type,
                payment:type,
                emiValue:price,
                details:paymentDetails
            });

            await details.save();

            return res.status(200).send({
                success:true,
                message:"",
                data:details
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

// @route   POST api/itinerarydetails/leave
// @desc    join user in list
// @access   Private
router.post('/leave',[
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
        try {   

            const details = await ItineraryDetails.findOneAndRemove({itineraryId:id,userId:req.user._id});

            res.status(200).send({
                success:true,
                message:"",
                data:details
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


// @route   POST api/itinerarydetails/update
// @desc    update payment status
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
        const {id} = req.body;
        try {   

            const updateBody = {
                payment:"done"
            }
            
            await ItineraryDetails.findOneAndUpdate({itineraryId:id,userId:req.user._id}, updateBody);

            const details = await ItineraryDetails.findOne({itineraryId:id,userId:req.user._id});

            res.status(200).send({
                success:true,
                message:"",
                data:details
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

// @route   POST api/itinerarydetails/pay
// @desc    pay
// @access   Private
router.post('/pay',[
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
        try {   


            const {paymentId} = req.body;
            const paymentDetailsBody = {
                paymentId,
                payementDate:Date.now()
            }
            await ItineraryDetails.findOneAndUpdate({itineraryId:id,userId:req.user._id}, 
                                    {$push:{details:paymentDetailsBody}});

            const details = await ItineraryDetails.findOne({itineraryId:id,userId:req.user._id});

            res.status(200).send({
                success:true,
                message:"",
                data:details
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

// @route   GET api/itinerarydetails/search/:id/:searchterm
// @desc    get itinery passanger details
// @access   Private
router.get('/search/:id/:search',[auth,
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
        const {id,search} = req.params;
        const itineraryDetails = await ItineraryDetails.find({itineraryId:id})
                                        

        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:itineraryDetails
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



module.exports = router;