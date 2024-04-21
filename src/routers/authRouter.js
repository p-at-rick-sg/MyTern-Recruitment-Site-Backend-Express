const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');

const {signup, signin, refresh} = require('../controllers/authController');
const {postGoogleAuthURL, getGoogleUserData} = require('../controllers/googleController');

//Signup Endpoint
router.put('/signup', signup);

//Signin Endpoint
router.post('/signin', signin);

//refresh Endpoint
router.post('/refresh', refresh);

//GOOGLE STUFF
//Post from the clien to get the google auth url which we return to the client
router.post('/google', postGoogleAuthURL);
//get takes the coe in query params and wthe backend gets the data from google (hopefully!)
router.get('/google', getGoogleUserData);

module.exports = router;
