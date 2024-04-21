const express = require('express');
const router = express.Router();
const {upload} = require('../middleware/filesMiddleware');

//Add controller imports here
const {uploadAsset} = require('../controllers/recruiterController');
//Import validators here

//Define endpoints and methods here

//GET

//PUT

//POST
router.post('recruiter/uploadAsset/:projectID', upload.single('image'), uploadAsset);

//PATCH

//DELETE

//Export
module.exports = router;
