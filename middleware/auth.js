const jwt = require('jsonwebtoken');
const config = require('config');
const User = require('../models/User');

module.exports = async (req,res,next) => {
    // Get token from header
    const token = req.header('x-auth-token');
    //check if no token
    if(!token)
    {
        return res.status(401).json({msg:'No token, auth failed'});
    }

    //verify token
    try{
        const decoded = jwt.verify(token,config.get('jwtSecret'));
        const user =  await User.findById(decoded.user._id).select("-password").populate("collegeId").populate("agencyId");
        req.user = user;
        next();
    }
    catch(err)
    {
        res.status(401).json({msg:"Token is not valid"});
    }
};