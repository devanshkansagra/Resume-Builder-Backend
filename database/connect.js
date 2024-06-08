const mongoose = require('mongoose');
const db = process.env.DATABASE || 'mongodb://localhost:27017/ResumeUsers';

mongoose.connect(db).then(() => {
    console.log("Database connected successfully");
}).catch((error) => {
    console.log('Unable to connect to database due to ', error);
})