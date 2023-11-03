const jwt = require('jsonwebtoken');
const { ACCESS_TOKEN_SECRET , REFRESH_TOKEN_SECRET } = require('../config/index');
const refreshToken = require('../models/token');


class JWTServices{
    // sign access token 
    static singAccessToken(payload, expiryTime){
        return jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: expiryTime });
    }
    // sign refresh token 
    static singRefreshToken(payload, expiryTime){
        return jwt.sign(payload, REFRESH_TOKEN_SECRET, {expiresIn: expiryTime });
    }

    // verify access token 
    static vefifyAccssToken(token){
        return jwt.verify(token, ACCESS_TOKEN_SECRET)
    }
    // verify refresh token
    static vefifyRefreshToken(token){
        return jwt.verify(token, REFRESH_TOKEN_SECRET);
    }

    // store refresh token 
    static async storeRefreshToken(token, userId){
        try {
            const newToken = new refreshToken({
                token:token,
                userId:userId
            });
            await newToken.save();

        } catch (error) {
            console.log(error)
        }
    }
}
module.exports = JWTServices;


