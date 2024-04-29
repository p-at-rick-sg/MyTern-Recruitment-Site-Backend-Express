const express = require('express');
const router = express.Router();
const {simpleGet} = require('../controllers/talentController');
const {upload} = require('../middleware/filesMiddleware'); //for the file upload middleware
const {uploadAsset, downloadAssetFromGCP} = require('../modules/uploads'); // all file handling modules
const {scanResume, scanResumeCVPP, formatResumeData} = require('../modules/ai');

//GET
router.get('/test', simpleGet);
router.get('/download', downloadAssetFromGCP);
router.get('/ai/:fileName', scanResume);
router.get('/ai-scan', scanResumeCVPP);

//POST
router.post('/upload', upload.single('resume'), uploadAsset);
router.post('/format', formatResumeData);
//PATCH

//DELETE

module.exports = router;
