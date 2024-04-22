const express = require('express');
const router = express.Router();
const {simpleGet} = require('../controllers/talentController');

//GET
router.get('', simpleGet);
//POST

//PATCH

//DELETE

module.exports = router;
