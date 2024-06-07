const express = require('express');

const {
    signup,
    login,
    profile,
    logout,
    forgot,
    resetPassword,
    edit,
} = require('../controllers/userController');

const verifyUser  = require('../middlewares/authMiddleware');

const userRouter = express.Router();

userRouter.post('/signup', signup);
userRouter.post('/login', login);
userRouter.get('/profile', verifyUser, profile);
userRouter.delete('/logout', verifyUser ,logout);
userRouter.post('/forgot', forgot);
userRouter.post('/resetPassword', resetPassword);
userRouter.post('/edit', edit);

module.exports = userRouter;