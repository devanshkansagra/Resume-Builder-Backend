const jwt = require('jsonwebtoken');
const User = require('../model/user');

const verifyUser = async (req, res, next) => {
    try {
        const accessToken = req?.cookies.AccessToken;
    
        if(!accessToken) {
            res.status(401).send({message: "Unauthorized"});
        }
    
        const verify = await jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET_KEY);
        const user = await User.findById(verify._id).select("-password -refreshToken");
    
        if(!user) {
            res.status(404).send({message: "Invalid Token, User not found"});
        }
    
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
    }
}

module.exports = verifyUser