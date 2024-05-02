const express = require('express');
const router = express.Router();
const {
  simpleGet,
  getUserBasic,
  updateSkills,
  deleteSkills,
  getSkills,
  updateBasic,
  addSkill,
} = require('../controllers/talentController');
const {upload} = require('../middleware/filesMiddleware'); //for the file upload middleware
const {uploadAsset, downloadAssetFromGCP} = require('../modules/uploads'); // all file handling modules
const {scanResume, scanResumeCVPP, formatResumeData} = require('../modules/ai');

//GET
router.get('/test', simpleGet);
router.get('/download', downloadAssetFromGCP);
router.get('/ai/:fileName', scanResume); //not using as it's flakey with google
router.get('/basic', getUserBasic); //later will change this to use the logged in user id from the token
router.get('/skills', getSkills);

//POST
router.post('/upload', upload.single('resume'), uploadAsset);
router.post('/format', formatResumeData);
router.post('/ai-scan', scanResumeCVPP); //this is the correct ai call to parse the uploaded resume
router.post('/add-skill', addSkill);

//PATCH
router.patch('/update-skills', updateSkills);
router.patch('/update-basic', updateBasic);

//DELETE
router.delete('/delete-skills', deleteSkills);

module.exports = router;
