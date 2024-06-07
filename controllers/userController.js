const user = require('../model/user');
const nodemailer = require('nodemailer');

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const findUser = await user.findById(userId);
        const accessToken = await findUser.generateAccessToken();
        const refreshToken = await findUser.generateRefreshToken();

        findUser.refreshToken = refreshToken;

        const validate = await findUser.save({validateBeforeSave: false});
        if(validate) {
            console.log("Refrence token added to schema");
        }
        else {
            console.log("Unable to add refresh token to schema");
        }

        return {accessToken, refreshToken}
    }
    catch(error) {
        console.log(error);
    }
}

const signup = async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const newUser = new user({ firstName, lastName, email, password });

        const validateEmail = await user.findOne({ email: email });
        if (validateEmail) {
            res.status(409).send({ "409Error": "Email in use" });
        }
        else {
            const userSave = await newUser.save();

            if (userSave) {
                res.status(201).send({ "201Success": "New User created" });
            }
        }
    } catch (error) {
        res.status(500).send({ "500Error": "Unable to register the user" });
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUser = await user.findOne({ email: email });
        const validatePassword = await findUser.isPasswordCorrect(password);
        if (findUser && validatePassword) {

            const {accessToken, refreshToken} = await generateAccessAndRefreshToken(findUser._id);

            console.log("Access token: ", accessToken, '\n');
            console.log("Refresh token: ", accessToken, '\n');
            res.status(200)
            .cookie("AccessToken", accessToken, {
                httpOnly: true,
                path: "/"
            })
            .cookie("RefreshToken", refreshToken, {
                httpOnly: true,
                path: "/"
            })
            .send({message: "Authorized"});
        }
        else if(!validatePassword) {
            res.status(401).send({message: "Unauthorized"});
        }
        else {
            res.status(404).send({message: "User Not found"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ "500Error": "Server Error" });
    }
}

const profile = async (req, res) => {

    const details = req.user;
    if(details) {
        res.status(200).send({details: details});
    }
    else {
        res.status(404).send({message: "User not found"});
    }
}

const logout = async (req, res) => {
    if (req.headers.cookie) {
        res.clearCookie('Email')
            .clearCookie('Password')
            .status(200).send({ "200Success": "User Logged Out" });
    }
}

const forgot = async (req, res) => {
    const { email } = req.body;

    let code = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'lorem.ipsum.sample.email@gmail.com',
            pass: 'tetmxtzkfgkwgpsc'
        }
    });
    var mailOptions = {
        from: 'lorem.ipsum.sample.email@gmail.com',
        to: email,
        subject: `Security code for verification`,
        text: `Thankyou for reaching us. Your security code for verification is: ${code}`
    };
    try {
        const userEmail = await user.findOne({ email: email });
        if (userEmail) {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    throw new Error(error);
                }
                else {
                    console.log('Email is sent');
                }
            })
            res.cookie('OTP', code, {
                maxAge: 60000,
                path: "/"
            }).cookie('Email', email, {
                maxAge: 60000,
                path: "/"
            })
                .status(200).send({ success: "User Found" });
        }
        else {
            res.status(404).send({ message: "Unauthorized" });
        }
    } catch (error) {
        res.status(500).send({ "500Error": "Unable to send email due to Server problems" })
    }
}

const resetPassword = async (req, res) => {
    if (req.headers.cookie) {
        const cookieEmail = req.cookies.Email;
        const cookieOTP = req.cookies.OTP;
        const { password, otp } = req.body.data;

        try {
            const updatePassword = await user.updateOne({ email: cookieEmail }, { password: password });
            if (updatePassword && (otp === cookieOTP)) {
                res.status(200).send({ message: "Password Updated Successfully" });
            }
            else if (otp !== cookieOTP) {
                res.status(401).send({ message: "Unauthorized" });
            }
        }
        catch (error) {
            res.status(500).send({ message: "Server Error" });
        }
    }
    else {
        console.log("Cookies weren't set by client side");
    }
}

const edit = async (req, res) => {
    if (req.headers.cookie) {
        const { firstName, lastName, email, oldpassword, newpassword} = req.body;
        try {
            const updateUser = await user.findOneAndUpdate({ email: email, password: oldpassword }, { firstName: firstName, lastName: lastName, password: newpassword });
            if (updateUser) {
                res.cookie('Email', email, {
                    maxAge: 900000,
                    path: "/"
                }).cookie('Password', newpassword, {
                    maxAge: 900000,
                    path: "/"
                });
                res.status(200).send({ message: "User Updated Successfully" });
            }
            else {
                res.status(403).send({message: "Passwords doesn't match"});
            }
        }
        catch (error) {
            res.status(500).send({ message: error });
        }
    }
    else {
        res.status(403).send({message: "Cookies are not generated"});
    }
}
module.exports = { signup, login, logout, profile, forgot, resetPassword, edit };