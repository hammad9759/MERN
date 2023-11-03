const Joi = require('joi');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const UserDTO = require('../dto/user');
const JWTServices = require('../services/JWTServices');
const RefreshToken = require('../models/token');


passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const authController = {
    async register(req, res, next) {
        // 1. validate user input
        const userRegisterSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            name: Joi.string().max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().pattern(passwordPattern).required(),
            confirmPassword: Joi.ref('password')
        });
        const { error } = userRegisterSchema.validate(req.body);

        // 2. if error in validation -> retrun error via middleware
        if (error) {
            return next(error);
        }
        // 3. if email or username is already registered -> return an error 
        const { username, name, email, password } = req.body
        try {
            const emailInUse = await User.exists({ email });
            const usernameUse = await User.exists({ username });
            if (emailInUse) {
                const error = {
                    status: 409,
                    message: 'Email already registered, use another email!'
                }
                return next(error);
            }
            if (usernameUse) {
                const error = {
                    status: 409,
                    message: 'User Name already registered, use another User Name!'
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }

        // 4. (if there is no error) password hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // 5.0 token genration
        let accessToken;
        let refreshToken;
        let user;
        try {
            // 5. store user data in database
            const userToRegister = new User({
                username: username,
                email: email,
                name: name,
                password: hashedPassword
            })
            user = await userToRegister.save();
            // token genration
            accessToken = JWTServices.singAccessToken({ _id: user._id}, '30min');
            refreshToken = JWTServices.singRefreshToken({ _id: user._id }, '60min');

        } catch (error) {
            return next(error);
        }
        // saving refreshToken to the database 
        await JWTServices.storeRefreshToken(refreshToken, user._id);

        // sending token data to cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 100 * 60 * 60 * 24,
            httpOnly: true //xss
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 100 * 60 * 60 * 24,
            httpOnly: true //xss
        });

        // 6. response send 
        const userDto = new UserDTO(user);
        return res.status(201).json({ user: userDto, auth:true })
    },

    async login(req, res, next) {
        // 1. validate user input 
        const userLoginSchema = Joi.object({
            username: Joi.string().min(5).max(30).required(),
            password: Joi.string().pattern(passwordPattern).required(),
        });
        const { error } = userLoginSchema.validate(req.body);

        // 2. if validate error, return error
        if (error) {
            return next(error);
        }

        // 3. match username and password
        const { username, password } = req.body
        let user;
        try {
            user = await User.findOne({ username: username });
            if (!user) {
                const error = {
                    status: 401,
                    message: 'invalid username!'
                }
                return next(error);
            }
            //match password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                const error = {
                    status: 401,
                    message: 'invalid password!'
                }
                return next(error);
            }

        } catch (error) {
            return next(error);
        }
        // 4.0 JWT
        // token genration
        const accessToken = JWTServices.singAccessToken({ _id: user._id }, '30min');
        const refreshToken = JWTServices.singRefreshToken({ _id: user._id }, '60min');

        try {
            //update or insert refreshtoken in database
            await RefreshToken.updateOne({
                _id: user._id
            },
                { token: refreshToken },
                { upsert: true }
            );
        } catch (error) {
            return next(error);
        }

        // sending token data to cookie
        res.cookie('accessToken', accessToken, {
            maxAge: 100 * 60 * 60 * 24,
            httpOnly: true //xss
        });
        res.cookie('refreshToken', refreshToken, {
            maxAge: 100 * 60 * 60 * 24,
            httpOnly: true //xss
        });

        // 4. return response
        const userDto = new UserDTO(user);

        return res.status(200).json({ user: userDto, auth:true });
    },

    async logout(req, res, next) {
               
        //1. delete refresh token form db
        const {refreshToken} = req.cookies;
        try {
            await RefreshToken.deleteOne({refreshToken});
        } catch (error) {
            return next(error);
        }
        
        //2. Clear the access token and refresh token cookies
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        
        //3.response 
        res.status(200).json({user:null, auth:false });
    },
    
    async refresh(req, res, next) {
        // 1. Get refresh token from cookies
        const originalRefreshToken = req.cookies.refreshToken;
        let id;
    
        try {
            // Verify the refresh token and extract the user ID
            const decodedToken = JWTServices.vefifyRefreshToken(originalRefreshToken);
            id = decodedToken._id;
        } catch (e) {
            const error = { status: 401, message: 'Unauthorized' };
            return next(error);
        }
    
        // 2. Verify the refresh token in the database
        try {
            const match = await RefreshToken.findOne({ _id: id, token: originalRefreshToken });
            if (!match) {
                const error = { status: 401, message: 'Unauthorized' };
                return next(error);
            }
        } catch (error) {
            return next(error);
        }
    
        // 3. Generate new tokens
        try {
            const accessToken = JWTServices.singAccessToken({ _id: id }, '30m');
            const refreshToken = JWTServices.singRefreshToken({ _id: id }, '60m');
    
            // Update or insert the refresh token in the database
            await RefreshToken.updateOne({ _id: id }, { token: refreshToken });
    
            // Sending token data to cookies
            res.cookie('accessToken', accessToken, { maxAge: 100 * 60 * 60 * 24, httpOnly: true });
            res.cookie('refreshToken', refreshToken, { maxAge: 100 * 60 * 60 * 24, httpOnly: true });
    

        } catch (e) {
            return next(e);
        }
        // 4. Fetch user data from the database and return the response
        const user = await User.findOne({ _id: id });
        const userDto = new UserDTO(user);
        return res.status(200).json({ user: userDto, auth: true });
    }
    

} 

module.exports = authController;