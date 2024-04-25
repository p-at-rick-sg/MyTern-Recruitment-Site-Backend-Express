const express = require('express');
const router = express.Router();
const {getSectors, getPostcodes, getCountries, whoAmI} = require('../controllers/apiController');

//GET ONLY HERE AS NO AUTHENTICATION REQUIRED
router.get('/sectors', getSectors);
router.get('/countries', getCountries);

//GET for LOGGED IN USERS ANY TYPE
router.get('/whoami', whoAmI);

module.exports = router;
