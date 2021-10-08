const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const {check, validationResult} = require('express-validator');
const config = require("config");
const multer = require('multer');
const {s3} = require('../../common/commonFunction');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const sgMail = require('@sendgrid/mail');

// @route    POST api/common/upload   
// @desc     upload image
// @access   Private
router.post('/upload', [
    multer({storage:multer.memoryStorage()}).single('image')], 
async(req,res)=>{

    try {
        let imageName = req.file.originalname.split('.');
        const fileType = imageName[imageName.length - 1];
        const params = {
            Bucket: config.get('AWSBucketName'),
            Key: `${uuidv4()}.${fileType}`,
            Body: req.file.buffer,
            ACL: "public-read",
        }
  
        s3.upload(params,(error,data)=>{
            if(error){
                res.status(500).send({
                    success:false,
                    message:error,
                    data:""
                });
            }
            return res.status(200).send({
                success:true,
                message:"",
                data:data
            });
        });
    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }
});


// @route    POST api/common/sms   
// @desc     send OTP
// @access   Private
router.post('/sms',[auth,[
    check('phone',"Phone Number is required")
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

    try {
        const code = Math.floor(100000 + Math.random() * 900000);
        const {phone} = req.body;
        await User.findByIdAndUpdate(req.user._id,{verificationCode:code});
        const apiKey = config.get('textLocalApiKey');
        //const message = `Thanks for verifying with Sailsmith. Here is your OTP ${code}`;
        const message=`Your OTP is ${code}. Please do not share anyone.`
        console.log(`https://api.textlocal.in/send?apiKey=${apiKey}&numbers=${phone}&sender=PARTIN&message=${message}&test=true`)

        axios.post(`https://api.textlocal.in/send?apiKey=${apiKey}&numbers=${phone}&sender=PARTIN&message=${message}&test=true`).then(response =>{
            return res.status(200).send({
                success:true,
                data:response.data,
                message:""
            })
        })
        .catch(error=>{
            console.log(error)
        });

        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }
});

// @route    POST api/common/email   
// @desc     send Email
// @access   Private
router.post('/email',[auth, [
    check('email',"email is required"),
    check('type',' Type is required')
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

    try {
        sgMail.setApiKey(config.get("sendGridApiKey"));
        const {type} = req.body;

        switch(type){
            case "verification":{
                const code = uuidv4();
                const {email} = req.body;
                await User.findByIdAndUpdate(req.user._id, {verificationToken:code});
                const msg = {
                    to: email,
                    from: "workforsmit@gmail.com",
                    templateId: 'd-8e8542597b4f478999e38fa5cccca879',
                    dynamicTemplateData: {
                        "message":`http://localhost:3000/userverify/${req.user._id}/${code}`
                    },
                };
                sgMail.send(msg)
                  .then(response =>{
                      return res.status(200).send({
                          success:true,
                          data:response,
                          message:""
                      })
                  });
                break;
            }

            case "payment-reminder":{
                const {email,amount, lastDate,itineraryId} = req.body;
                const itinerary = await Itinerary.findById(itineraryId);
                const {name} = itinerary;
                const msg = {
                    to: email,
                    from: "workforsmit@gmail.com",
                    templateId: 'd-82aa8378228949d6b714917483d5b0fb',
                    dynamicTemplateData: {
                        name,
                        amount,
                        lastDate,
                    },
                };
                sgMail.send(msg)
                  .then(response =>{
                      return res.status(200).send({
                          success:true,
                          data:response,
                          message:""
                      })
                  });
                break;
            }
            case "itinerary-invite":{
                const {email,itineraryId, url} = req.body;
                const itinerary = await Itinerary.findById(itineraryId);
                const {name} = itinerary;
                const msg = {
                    to: email,
                    from: "workforsmit@gmail.com",
                    templateId: 'd-909f6c298e9b42608dd7cbea8dfd0f2a',
                    dynamicTemplateData: {
                        name,
                        url
                    },
                };
                sgMail.send(msg)
                  .then(response =>{
                      return res.status(200).send({
                          success:true,
                          data:response,
                          message:""
                      })
                  });
                break;
            }
        }

       
        
    } catch (error) {
        res.status(500).send({
            success:false,
            message:error.message,
            data:""
        });
    }
});

// @route    POST api/common/event   
// @desc     upload image
// @access   Private
router.post('/event', 
async(req,res)=>{

    try {

            return res.status(200).send({
                success:true,
                message:"",
                data:{req,res}
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