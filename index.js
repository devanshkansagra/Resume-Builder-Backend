const express = require('express');
const app = express();

const port = 4000;

require('./database/connect');


// Basic Routes

app.listen(port, () => {
    console.log('Server is started at port ', port);
})