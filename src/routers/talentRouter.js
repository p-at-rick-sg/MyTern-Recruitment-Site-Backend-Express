const express = require('express');
const router = express.Router();
const {simpleGet} = require('../controllers/talentController');

//GET
router.get('/test', simpleGet);

//POST

//PATCH

//DELETE

module.exports = router;
