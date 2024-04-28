const express = require('express');
const router = express.Router();
const {simpleGet} = require('../controllers/talentController');
const {upload} = require('../middleware/filesMiddleware'); //for the file upload middleware
const {uploadAsset, downloadAssetFromGCP} = require('../modules/uploads'); // all file handling modules
const {scanResume, scanResumeCVPP, tmpSkills} = require('../modules/ai');

//GET
router.get('/test', simpleGet);
router.get('/download', downloadAssetFromGCP);
router.get('/ai/:fileName', scanResume);
router.get('/ai-scan/:fileName', scanResumeCVPP);
router.get('/skills', tmpSkills);

//POST
router.post('/upload', upload.single('resume'), uploadAsset);
//PATCH

//DELETE

module.exports = router;
