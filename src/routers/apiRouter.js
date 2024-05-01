const express = require('express');
const router = express.Router();
const {
  getSectors,
  getPostcodes,
  getCountries,
  whoAmI,
  getSkills,
} = require('../controllers/apiController');

const {authAny} = require('../middleware/authMiddleware');

//GET ONLY HERE AS NO AUTHENTICATION REQUIRED
router.get('/sectors', getSectors);
router.get('/countries', getCountries);
router.get('/skills/:userId?', getSkills);

//GET for LOGGED IN USERS ANY TYPE
router.get('/whoami', authAny, whoAmI);

module.exports = router;
