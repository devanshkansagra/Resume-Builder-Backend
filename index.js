const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/userRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

app.use(cors({
    origin: 'https://techcv.netlify.app/', // allow requests from this origin
    methods: ['GET', 'POST', 'DELETE'], // allow these HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // allow these headers
}));

dotenv.config({ path: './.env' });
const port = process.env.PORT || 4000;

require('./database/connect');

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use('/users', userRouter);

app.listen(port, () => {
    console.log('Server is started at port ', port);
})