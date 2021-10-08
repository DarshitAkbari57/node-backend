const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require("config");
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator');
const auth = require('../../middleware/auth');
const gravatar = require('gravatar');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');


const User = require('../../models/User');
const Agency = require('../../models/Agency');
const College = require('../../models/College');
const ForgetPassword = require('../../models/ForgetPassword');
const Notification = require('../../models/Notification');
const RecentAction = require('../../models/RecentAction');

// @route    GET api/auth
// @desc     get user data
// @access   Private
router.get('/',auth,async (req,res)=>{
    try{
        const user = await User.findById(req.user._id).select('-password').populate("agencyId").populate("collegeId");
        console.log(121)
        res.status(200).send({
            success:true,
            message:"",
            data:user
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


// @route    GET api/auth/users
// @desc     get user by college id
// @access   Private
router.get('/users',[auth]
    ,async (req,res)=>{

    try{
        const {type} = req.user;
        console.log(type)
        switch(type){
            case "student":
            case "college":
            case "faculty":{
                const {collegeId} = req.user;
                let user = await User.find({collegeId:collegeId._id}).select('-password').populate('collegeId');
                // console.log(user[0]._id,req.user._id,user[0]._id.toString())
                user = user.filter((u)=> u._id.toString()!=req.user._id.toString())
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:user
                });
            }

            case "admin":{
                let user = await User.find({}).select('-password').populate('collegeId');
                // console.log( typeof user[0]._id, typeof req.user._id.toString(),user[0]._id.toString())

                user = user.filter((u)=>u._id.toString()!==req.user._id.toString())
                return res.status(200).send({
                    success:true,
                    message:"",
                    data:user
                });
            }

            case "agency":
            case "agent":{
                const {agencyId} = req.user;
                let user = await User.find({agencyId:agencyId._id}).select('-password').populate('agencyId');
                user = user.filter((u)=>u._id.toString()!==req.user._id.toString());
                
                res.status(200).send({
                    success:true,
                    message:"",
                    data:user
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

// @route    POST api/auth/login
// @desc     login route
// @access   Public
router.post('/login',[
    check('email','include email').isEmail(),
    check('password','correct password required').exists("password required")
  ],
  async (req,res)=>{
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
  
      const {email, password} = req.body;
      try
      {
          //see if user exists
          let user = await User.findOne({email}).populate("collegeId").populate("agencyId");
         
          if(!user)
          {
              return res.status(400).json({
                success:false,
                message:"invalid id or password",
                data:""
            });
          }
        //   console.log(user.type)
          if(user.verified===false && user.type!=undefined){
            errors.message = 'Please contact your supervisor to verify your profile';
            console.log(errors)
            return res.status(400).send({
                success:false,
                message:errors.message,
                data:""
            });;
        }

          const isMatch = await bcrypt.compare(password,user.password);
          if(!isMatch)
          {
            return  res.status(400).json({
                success:false,
                message:"invalid id or password",
                data:""
            });
          }
          delete user["password"]
          //return JWT
          const payload ={
                  user
          }
  
          jwt.sign(
              payload,
              config.get("jwtSecret"),
              {expiresIn:360000},
              (err,token) => {
                  if(err) throw err;
                  res.status(200).send({
                      success:true,
                      message:"",
                      data:{token,user}
                  });
              }
          );
      
      }
      catch(err)
      {
          console.log(err);
          res.status(500).send({
              success:false,
              message:err.message,
              data:""
          });
      }
      
  });

// @route    PUT api/auth/register
// @desc     register route
// @access   Private
  router.post('/register',[
    check('email','include email').isEmail(),
    check('password','correct password required').exists("password required"),
    check('first_name','Enter First Name').exists(),
    check('last_name','Enter Last Name').exists(),
  //  check('phone','Enter Your Phone Number').exists(),
  ], async (req, res) => {

    // Check Validation
    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    }
    
    try {
        const {first_name,last_name, email, password} = req.body;
        const user = await User.findOne({ email }).select("-password");
        
        if (user) {
            errors.message = 'Email already exists';
            console.log(errors)
            return res.status(400).send({
                success:false,
                message:errors.message,
                data:""
            });;
        }


    
        const avatar = await gravatar.url(req.body.email, {
        s: '200', // Size
        r: 'pg', // Rating
        d: 'mm' // Default
        });
        
      
        const newUser = new User({
            first_name,
            last_name,
            email,
            avatar,
       //     phone,
            password
        });
    
        const salt = await bcrypt.genSalt(10);
        newUser.password = await bcrypt.hash(password, salt);
        await newUser.save();
        const sendingUser = await User.findOne({email:email}).select("-password").populate("collegeId");

        const payload ={
            user:sendingUser
    }

    jwt.sign(
        payload,
        config.get("jwtSecret"),
        {expiresIn:360000},
        (err,token) => {
            if(err) throw err;
            res.status(200).send({
                success:true,
                message:"",
                data:{token,user:sendingUser}
            });
        }
    );

    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
        
    }
   
   }
);


// @route    PUT api/auth/update
// @desc     Update route
// @access   Private
router.put('/update', auth
,async (req, res) => {

    try {
        let {
            email,
            first_name,
            last_name, 
            phone,
            type,
            street,
            city,
            state,
            zip,
            country,
            collegeId,
            college=null,
            agency=null,
            agencyId,
            avatar,
            bio,
            interest,
            verified,
        } = req.body;

        if(req.user.type=="admin" || req.user.type=="college" || req.user.type=="agency"){
            verified=true
        }
        if(college){
            console.log("new collage ..")
            console.log(college)
           college = await new College({
                ...college,
                userId: req.user._id
            }).save();

            console.log(college)
            collegeId = college._id
        }

        if(agency){
            console.log("new Agency ..")
            console.log(agency)
            agency = await new Agency({
                ...agency,
                userId: req.user._id
            }).save();

            console.log(agency)
            agencyId = agency._id
        }

        const updateUserBody = {
            email : email ? email : req.user.email,
            first_name : first_name ? first_name : req.user.first_name,
            last_name : last_name ? last_name : req.user.last_name,
            phone : phone ? phone : req.user.phone,
            type : type ? type : req.user.type,
            address:{
                street : street ? street : req.user.address.street,
                city : city ? city : req.user.address.city,
                state : state ? state : req.user.address.state,
                zip : zip ? zip : req.user.address.zip,
                country: country ? country : req.user.country,
            },
            collegeId : collegeId ? collegeId : req.user.collegeId,
            agencyId : agencyId ? agencyId : req.user.agencyId,
            avatar: avatar ? avatar : req.user.avatar,
            bio: bio ? bio : req.user.bio,
            interest: interest ? interest : req.user.interest,
            verified: verified ? verified : req.user.verified
        }
        console.log(updateUserBody)
        await User.findByIdAndUpdate(req.user._id,updateUserBody);

        let user = await User.findById(req.user._id).select("-password").populate("collegeId").populate("agencyId");

        switch(type){
            case "college":
            case "student":{
                const college = await College.findById(collegeId).populate('userId',"-pasword");
                const {userId} = college;
                console.log(111)
                const notificationBody = {
                    type:"student",
                    message:`${user.first_name} ${user.last_name} joined your college as ${type}. Check his data here`,
                    userId:userId._id,
                    collegeId:collegeId,
                    createdBy: user._id
                };
    
                const recentActionBody = {
                    userId:req.user._id,
                    collegeId:collegeId,
                    action:`${user.first_name} ${user.last_name} joined your college as ${type}.`
                }
    
                const newNotification = new Notification(notificationBody);
                const newRecentAction = new RecentAction(recentActionBody);
    
                await newNotification.save();
                await newRecentAction.save();
    
                req.io.to(college.userId.socketId).emit("student",JSON.stringify(notificationBody));
                break;
            }

            case "agent":
            case "agency":{
                const agency = await Agency.findById(agencyId).populate('userId',"-pasword");
                const {userId} = agency;
                //console.log(userId)
                console.log(111)
                const notificationBody = {
                    type:"agency",
                    message:`${user.first_name} ${user.last_name} joined your Agency as ${type}. Check his data here`,
                    userId:userId._id,
                    agencyId:agencyId,
                    createdBy: user._id
                };
    
                const recentActionBody = {
                    userId:req.user._id,
                    agencyId:agencyId,
                    action:`${user.first_name} ${user.last_name} joined your Agency as ${type}.`
                }
    
                const newNotification = new Notification(notificationBody);
                const newRecentAction = new RecentAction(recentActionBody);
    
                await newNotification.save();
                await newRecentAction.save();
                break;
               // req.io.to(college.userId.socketId).emit("student",JSON.stringify(notificationBody));
            }
            
        }
        user = await User.findById(req.user._id).select("-password").populate("collegeId").populate("agencyId");
        res.status(200).json({
            success:true,
            message:"",
            data:user
        })

    
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Internal Server Error",
            data:""
        });
    }   
});


// @route    DELETE api/auth/delete
// @desc     delete route
// @access   Private
router.delete('/delete',[
    auth,
],async (req, res) => {

    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    }   

    try {
        
        const user =await User.findByIdAndRemove(req.user._id).select("-password");
        
        res.status(200).json({
            success:true,
            message:"",
            data:user
        });

    
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Internal Server Error",
            data:""
        });
    }   
});

// @route    DELETE api/auth/delete
// @desc     Update route
// @access   Private
router.delete('/deleteuser/:id',[
    auth,
],async (req, res) => {

    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    }   

    try {

        const{id} = req.params
        
        const user =await User.findByIdAndRemove(id).select("-password");
        
        res.status(200).json({
            success:true,
            message:"",
            data:user
        });

    
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success:false,
            message:"Internal Server Error",
            data:""
        });
    }   
});


// @route    POST api/auth/forget
// @desc    forget password mail and link generation
// @access   Private
router.post('/forget',[
    check('email','include email').isEmail(),
],async (req,res)=>{

    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    } 
    try{
        const {email} = req.body;
        const user = await User.findOne({email}).select('_id');
        const linkId = crypto.randomBytes(15).toString('hex');
        const forgetPassword = new ForgetPassword({
            userId:user._id,
            linkId: linkId
        });
        
        await forgetPassword.save();

        // //email part remains
        sgMail.setApiKey(config.get("sendGridApiKey"));
        const msg = {
            to: email,
            from: "workforsmit@gmail.com",
            templateId: 'd-55acacd463c546439b7ba7b6f5c8f1cf',
            dynamicTemplateData: {
                link:`http://localhost:3000/update/password/${linkId}`
            },
        };
        await sgMail.send(msg);
    

        res.status(200).send({
            success:true,
            message:"",
            data:forgetPassword
        });

    }
    catch(err){
        console.log("err",err.response.body);
        res.status(500).send({
            success:false,
            message:"Please check Email Address",
            data:""
        });
    }
});


// @route    POST api/auth/changepassword
// @desc     change password
// @access   Private
router.post('/changepassword', [
    auth,
    check('old_password', 'include old password').exists(),
    check('new_password', 'include new password').exists(),
    check('confirm_password', 'include confirm password').exists(),
], async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors)
        return res.status(400).json({
            success: false,
            message: errors,
            data: ""
        });
    }
    try {
        const { old_password, new_password, confirm_password } = req.body;
        let user = await User.findOne({ email: req.user.email })

        if (!user || !bcrypt.compareSync(old_password, user.password)) {
            return res.status(400).json({
                success: false,
                message: "old password doesn't match",
                data: ""
            });
        }
        if (new_password !== confirm_password) {
            return res.status(400).json({
                success: false,
                message: "new password and confirm password doesn't match",
                data: ""
            });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(new_password, salt);
        user.save();
        user = await User.findById(user._id).select('-password').lean();

        res.status(200).send({
            success: true,
            message: "",
            data: user
        });

    }
    catch (err) {
        console.log(err.message);
        res.status(500).send({
            success: false,
            message: err.message,
            data: ""
        });
    }
});


// @route    POST api/auth/updatepassword
// @desc     updatew password
// @access   Private
router.post('/updatepassword',[
    check('linkId','include linkId').exists(),
    check('password','include password').exists(),
],async (req,res)=>{

    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    } 
    try{
        const {password, linkId} = req.body;
        const forget_user = await ForgetPassword.findOne({linkId}).select('userId');
        let user = await User.findById(forget_user.userId).select("-password");
        const updateUserBody = {
            password
        }
        const salt = await bcrypt.genSalt(10);
        updateUserBody.password = await bcrypt.hash(password, salt);
        await User.findByIdAndUpdate(user._id,updateUserBody).select('-password'); 
        user = await User.findById(user._id).select('-password');

        res.status(200).send({
            success:true,
            message:"",
            data:user
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

// @route    POST api/auth/socketupdate
// @desc    update socketId
// @access   Private
router.post('/socketupdate',[auth,[
    check('socketId','include socketId').exists(),
]],async (req,res)=>{

    const errors = validationResult(req);
      if(!errors.isEmpty()){
        console.log(errors)
      return res.status(400).json({
          success:false,
          message:errors,
          data:""
      });
    } 
    try{
        const { socketId } = req.body;
        
        await User.findByIdAndUpdate(req.user._id,{socketId:socketId}).select("-password")

        const user = await User.findById(req.user._id).select("-password").populate('agencyId').populate("collegeId");

        res.status(200).send({
            success:true,
            message:"",
            data:user
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

// @route    GET api/agentsearch   
// @desc    agent data
// @access   Private
router.get('/agentsearch',auth,async (req,res)=>{
    try{
        let user = await User.find({}).select("-password");

        user.filter((u)=> u.type==='agent');

        user = new User(user);

        const {email, phone, name} = req.body;
        
        let searchedUser;
        if(Object.keys(req.body).length===0)
        {
            searchedUser = await User.find({type:"agent"}).select("-password");
        }
        else{
            searchedUser = await User.find(
                {
                    $and:[
                        {type:"agent"},
                        {$or:[
                            {
                                email:email
                            },
                            {
                                phone:phone
                            }
                        ]}
                    ]
                }
            ).select("-password")
        }

        res.status(200).send({
            success:true,
            message:"",
            data:searchedUser
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


// @route    GET api/auth/students 
// @desc     get student from same college as user
// @access   Private
router.get('/students',auth,async (req,res)=>{
    try{
        const searchedUser = await User.find({
            $and:[
                {type:"student"},
                {collegeId:req.user.collegeId},
                {collegeId:{$ne:null}}
            ]
        }).select("-password")
        res.status(200).send({
            success:true,
            message:"",
            data:searchedUser
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


// @route    GET api/auth/approve 
// @desc     approve user
// @access   Private
router.put('/approve',[auth,[
    check('id','ID of student is required').exists()
]],async (req,res)=>{

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

        const {id} = req.body
        
        await User.findByIdAndUpdate(id,{verified:true});

        const user = await User.findById(req.user._id).select("-password")

        res.status(200).send({
            success:true,
            message:"",
            data:user
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

// @route    POST api/auth/userverify 
// @desc     verify email
// @access   Public
router.post('/userverify/:userId/:token',async (req, res) => {
    try {
        const {userId, token} = req.params;

        const user = await User.findById(userId);

        const {verificationToken} = user;

        if(token!==verificationToken){
            return res.status(500).send({
                success:false,
                message:"Token is not valid",
                data:""
            });
        }

        await User.findByIdAndUpdate(userId, {emailVerified: true});
        
        return res.status(200).send({
            success:true,
            message:"",
            data:user
        });

    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }
});

// @route    GET api/auth/smsverify 
// @desc     verify email
// @access   Public
router.post('/smsverify',[auth,[
    check("otp","Code is required")
]],async (req, res) => {
    try {
        const {otp} = req.body;
        let user = await User.findById(req.user._id);

        const {verificationCode} = user;
        console.log(verificationCode,otp)
        if(otp!==verificationCode){
            return res.status(500).send({
                success:false,
                message:"OTP is not valid",
                data:""
            });
        }

        await User.findByIdAndUpdate(req.user._id, {phoneVerified: true});

        user = await User.findById(req.user._id)
        
        return res.status(200).send({
            success:true,
            message:"",
            data:user
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