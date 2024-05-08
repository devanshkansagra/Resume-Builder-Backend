const express = require('express');
const app = express();
const user = require('./model/user');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');

const port = 4000;

require('./database/connect');

// Middlewares
app.use(express.json());
app.use(cookieParser());

// Basic Routes
app.post('/signup', async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
        const newUser = new user({ firstName, lastName, email, password });

        const validateEmail = await user.findOne({ email: email });
        if (validateEmail) {
            res.status(409).send({ "409Error": "Email in use" });
        }
        else {
            const userSave = await newUser.save();

            // Creating a log whenever new users sign up
            var currentDate = new Date();

            var year = currentDate.getFullYear();
            var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
            var day = ('0' + currentDate.getDate()).slice(-2);
            var hours = ('0' + currentDate.getHours()).slice(-2);
            var minutes = ('0' + currentDate.getMinutes()).slice(-2);
            var seconds = ('0' + currentDate.getSeconds()).slice(-2);

            var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            let log = `\n[${formattedDateTime}] INFO: New user Signed UP \nEmail: ${email} \nIP Address: ${req.ip} \n`

            fs.appendFile('./logs.txt', log, 'utf-8', (err, data) => {
                if (err) {
                    console.log('Unable to enter the log')
                }
            })

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
})
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const findUser = await user.findOne({ email: email, password: password });
        if (findUser) {

            // Creating a log whenever new users sign up
            var currentDate = new Date();

            var year = currentDate.getFullYear();
            var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
            var day = ('0' + currentDate.getDate()).slice(-2);
            var hours = ('0' + currentDate.getHours()).slice(-2);
            var minutes = ('0' + currentDate.getMinutes()).slice(-2);
            var seconds = ('0' + currentDate.getSeconds()).slice(-2);

            var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
            let log = `\n[${formattedDateTime}] INFO: User Logged in \nEmail: ${email} \nIP Address: ${req.ip} \n`

            fs.appendFile('./logs.txt', log, 'utf-8', (err, data) => {
                if (err) {
                    console.log('Unable to enter the log')
                }
            })

            res.cookie('Email', email, {
                maxAge: 900000,
                path: "/"
            }).cookie('Password', password, {
                maxAge: 900000,
                path: "/"
            }).send({ "200OK": "Authorized User" })
        }
        else {
            res.status(401).send({ "401Unauthorized": "Unauthorized User" });
        }
    } catch (error) {
        res.status(500).send({ "500Error": "Unable to login" });
    }
})
app.get('/profile', async (req, res) => {


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
})
app.delete('/logout', async (req, res) => {
    if (req.headers.cookie) {

        var currentDate = new Date();

        var year = currentDate.getFullYear();
        var month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
        var day = ('0' + currentDate.getDate()).slice(-2);
        var hours = ('0' + currentDate.getHours()).slice(-2);
        var minutes = ('0' + currentDate.getMinutes()).slice(-2);
        var seconds = ('0' + currentDate.getSeconds()).slice(-2);

        var formattedDateTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
        let log = `\n[${formattedDateTime}] INFO: User Logged out: \nIP Address: ${req.ip} \n`

        fs.appendFile('./logs.txt', log, 'utf-8', (err, data) => {
            if (err) {
                console.log('Unable to enter the log')
            }
        })

        res.clearCookie('Email')
            .clearCookie('Password')
            .status(200).send({ "200Success": "User Logged Out" });
    }
})

app.post('/forgot', async (req, res) => {
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
})

app.post('/resetPassword', async (req, res) => {
    if(req.headers.cookie) {
        const cookieEmail = req.cookies.Email;
        const cookieOTP = req.cookies.OTP;
        const {password, otp} = req.body.data;

        try {
            const updatePassword = await user.updateOne({email: cookieEmail}, {password: password});
            if(updatePassword && (otp === cookieOTP)) {
                res.status(200).send({message: "Password Updated Successfully"});
            }
            else if(otp !== cookieOTP) {
                res.status(401).send({message: "Unauthorized"});
            }
        }
        catch(error) {
            res.status(500).send({message: "Server Error"});
        } 
    }
    else {
        console.log("Cookies weren't set by client side");
    }
})

app.listen(port, () => {
    console.log('Server is started at port ', port);
})