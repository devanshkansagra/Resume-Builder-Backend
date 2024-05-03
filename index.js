const express = require('express');
const app = express();

const port = 4000;

require('./database/connect');


// Basic Routes
app.post('/signup', (req, res) => {
    res.send('Signup');
})
app.post('/login', (req, res) => {
    res.send('login');
})
app.get('/profile', (req, res) => {
    res.send('profile');
})
app.delete('/logout', (req, res) => {
    res.send('login');
})

app.listen(port, () => {
    console.log('Server is started at port ', port);
})