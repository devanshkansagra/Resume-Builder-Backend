const user = require('../model/user');
const nodemailer = require('nodemailer');

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
                res.cookie('Email', email, {
                    maxAge: 900000,
                    path: "/"
                }).cookie('Password', password, {
                    maxAge: 900000,
                    path: "/"
                })
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
        const findUser = await user.findOne({ email: email, password: password });
        if (findUser) {

            res.cookie('Email', email, {
                maxAge: 900000,
                path: "/"
            }).cookie('Password', password, {
                maxAge: 900000,
                path: "/"
            });
            res.status(200).send({ "200OK": "Authorized User" })
        }
        else {
            res.status(401).send({ "401Unauthorized": "Unauthorized User" });
        }
    } catch (error) {
        res.status(500).send({ "500Error": error });
    }
}

const profile = async (req, res) => {

    const { Email, Password } = req.cookies;
    try {
        const details = await user.findOne({ email: Email, password: Password });
        if (details) {
            res.status(200).send({ details: details });
        }
        else {
            res.status(401).send({ "401Error": "Unauthorized" });
        }
    } catch (error) {
        res.status(500).send({ "500Error": "Unable fetch details" });
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
module.exports = { signup, login, profile, logout, forgot, resetPassword };