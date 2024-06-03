const express = require('express');
const app = express();
const user = require('./model/user');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');
const userRouter = require('./routes/userRoutes');

const port = 4000;

require('./database/connect');

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/users', userRouter);

app.listen(port, () => {
    console.log('Server is started at port ', port);
})