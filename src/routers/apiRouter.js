const express = require('express');
const router = express.Router();
const {getSectors, getPostcodes, getCountries} = require('../controllers/apiController');

//GET ONLY HERE AS NO AUTHENTICATION REQUIRED
router.get('/sectors', getSectors);

module.exports = router;
