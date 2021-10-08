const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const config = require("config");

const College = require('../../models/College');
const User = require('../../models/User');


// @route   GET api/college
// @desc    get user's college information
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
        const college = await College.findById(req.user.collegeId);
        // req.io.emit("message","Hey!")
        return res.status(200).send({
            success:true,
            message:"",
            data:college
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



// @route    GET api/college/users
// @desc     get user list from college id
// @access   Private
router.get('/users',[auth,
    [check("collegeId","College Id is required").exists()]]
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
        const {collegeId} = req.body;
        const users = await College.find({});
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

// @route    GET api/college/all
// @desc     get user list from college id
// @access   Private
router.get('/all',async (req,res)=>{

    try{
        const {collegeId} = req.body;
        const user = await User.find({collegeId}).select('-password');
        res.status(200).send({
            success:true,
            message:"",
            data:user
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

// @route    GET api/college/list
// @desc     get all college List
// @access   Private
router.get('/list',async (req,res)=>{

    try{
        // const {collegeId} = req.body;
        const college = await College.find({}).populate('userId');
        res.status(200).send({
            success:true,
            message:"",
            data:college
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

// @route   post api/college/create
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

            const { name, email, city, street, zip, phone } = req.body;

            let college = new College({
                name,
                email,
                phone,
                address:{
                    city,
                    street,
                    state,
                    zip
                },
                userId: req.user._id
            });

            await college.save();

            college = await College.findOne({userId:req.user._id});

            const user = await User.findByIdAndUpdate(req.user._id,{collegeId:college._id});

            res.status(200).send({
                success:true,
                message:"",
                data:college
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
        check('id','ID of College is required').exists()
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
            const { id, name, email, city, street, zip, phone,country } = req.body;
            
            const college = await College.findById(id);

            const updateCollegeBody = {
                name: name?name:college.name,
                email : email?email:college.email,
                phone : phone?phone:college.phone,
                address:{
                    street : street?street:college.address.street,
                    city : city?city:college.address.city,
                    state : state?state:college.address.state,
                    zip : zip?zip:college.address.zip,
                    country: country?country:college.address.country,
                },
                userId: req.user._id
            };

            await College.findByIdAndUpdate(id,updateCollegeBody);
            
            const updatedCollege = await College.findById(id);

            res.status(200).send({
                success:true,
                message:"",
                data:updatedCollege
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

        const college =await College.findByIdAndRemove(id);
        
        res.status(200).json({
            success:true,
            message:"",
            data:college
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