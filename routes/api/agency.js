const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');

const College = require('../../models/College');
const User = require('../../models/User');


// @route   GET api/agency
// @desc    get user's college information
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
        console.log(req.user.agencyId)
        const agency = await Agency.findById(req.user.agencyId);
        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:agency
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

// @route   GET api/agency/all
// @desc    get all Agency
// @access   Private
router.get('/all',auth,async (req,res)=>{
    try{
        const agency = await Agency.find({});
        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:agency
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
    


// @route    GET api/agency/users
// @desc     get user list from college id
// @access   Private
router.get('/users',[auth,
    [check("agencyId","Agency Id is required").exists()]]
    ,async (req,res)=>{

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
        const {agencyId} = req.body;
        const users = await User.find({agencyId:agencyId}).select("-password");
        res.status(200).send({
            success:true,
            message:"",
            data:users
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

// @route    GET api/agency/list
// @desc     get all agency List
// @access   Private
router.get('/list',async (req,res)=>{

    try{
        // const {collegeId} = req.body;
        const agency = await Agency.find({}).populate('userId');
        res.status(200).send({
            success:true,
            message:"",
            data:agency
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

// @route   post api/agency/create
// @desc    create new College
// @access   Private
router.post('/create',[
    auth,
    [
        check('name','name is required').exists(),
        check('email','include email').isEmail().exists(),
        check('city','City is required').exists(),
        check('state','State is required').exists(),
        check('street','Street is required').exists(),
        check('zip','zip is required').exists(),
        check('phone','Phone is required').exists()
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

            const { name, email, city, street, zip, phone, logo } = req.body;

            let agency = new Agency({
                name,
                email,
                phone,
                address:{
                    city,
                    street,
                    state,
                    zip
                },
                userId: req.user._id,
                logo,
            });

            await agency.save();

         //   agency = await Agency.findOne({userId:req.user._id});

         //   const user = await User.findByIdAndUpdate(req.user._id,{agencyId:agency._id});

            res.status(200).send({
                success:true,
                message:"",
                data:agency
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

// @route   PUT api/college/update
// @desc    update user's college
// @access   Private
router.put('/update',[
    auth,
    [
        check('id','ID of agnecy is required').exists()
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
            const { id, name, email, city, street, zip, phone ,state, country,logo } = req.body;
            
            const agency = await Agency.findById(id);

            const updateAgencyBody = {
                name: name ? name : agency.name,
                email : email ? email :agency.email,
                phone : phone ? phone : agency.phone,
                address:{
                    street : street ?street : agency.address.street,
                    city : city ? city : agency.address.city,
                    state : state ? state : agency.address.state,
                    zip : zip ? zip : agency.address.zip,
                    country : country ? country : agency.address.country,
                },
                userId: req.user._id,
                logo: logo ? logo : agency.logo
            };
            console.log(id,updateAgencyBody)
            await Agency.findByIdAndUpdate(id,updateAgencyBody);
            
            const updatedAgency = await Agency.findById(id);

            res.status(200).send({
                success:true,
                message:"",
                data:updatedAgency
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

// @route   DELETE api/college/delete
// @desc    delete user's college
// @access   Private
router.delete('/delete',[
    auth,[
        check('id','Id of College is required').exists()
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

        const agency =await Agency.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:agency
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