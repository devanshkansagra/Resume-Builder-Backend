const express = require('express');
const app = express();
const user = require('./model/user');
const cookieParser = require('cookie-parser');

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
    // const Email = "dkansagra04@gmail.com";
    // const Password = "123456";

    const {Email, Password} = req.cookies;
    try {
        const details = await user.findOne({ email: Email, password: Password });
        if (details) {
            res.status(200).send({details: details});
        }
        else {
            res.status(401).send({"401Error": "Unauthorized"});
        }
    } catch (error) {
        res.status(500).send({ "500Error": "Unable fetch details" });
    }
})
app.delete('/logout', (req, res) => {
    res.send('login');
})

app.listen(port, () => {
    console.log('Server is started at port ', port);
})