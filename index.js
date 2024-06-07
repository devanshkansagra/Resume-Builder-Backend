const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const dotenv = require('dotenv');

dotenv.config({path: './.env'});
const port = 4000;

require('./database/connect');

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/users', userRouter);

app.listen(port, () => {
    console.log('Server is started at port ', port);
})