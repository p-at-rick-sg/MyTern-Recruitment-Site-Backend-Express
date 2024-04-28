const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
const path = require('path');
const fs = require('fs/promises');
const fsAsync = require('fs');

const projectId = 'ga-project-4-420504';
const location = 'us';
const processorId = '9fcf1ab279afbca3';
// const filePath = './PatrickKittleResumePDF.pdf';

const client = new DocumentProcessorServiceClient();

const scanResume = async (req, res) => {
  const fileName = req.params.fileName;
  console.log('passed filename: ', fileName);
  const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;
  const fs = require('fs/promises');
  const filePath = '../../uploads/' + fileName;
  try {
    await fs.access(path.resolve(__dirname, filePath));
  } catch (err) {
    console.error('File not found:', filePath);
    return 1;
  }
  try {
    const data = await fs.readFile(path.resolve(__dirname, filePath));
    // Process the data from the downloaded PDF file
    console.log('Successfully read file');
  } catch (err) {
    console.error('Error reading file:', err);
  }
  try {
    const imageFile = await fs.readFile(path.resolve(__dirname, filePath));
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: 'application/pdf',
      },
    };

    const [result] = await client.processDocument(request);
    const {document} = result;
    console.log('Entities: ', document.entities);
    return res.status(200).json(document.entities);
  } catch (err) {
    console.error('failed to analyse resume');
    return res.status(400).json({status: 'error', msg: 'failed to analyse resume'});
  }
};
//
const scanResumeCVPP = async (req, res) => {
  console.log('CV PArser Resume Scanner Running');
  const fileName = req.params.fileName;
  console.log('passed filename: ', fileName);
  const filePath = path.resolve(__dirname, '../../uploads/', fileName);
  const fileContent = await fs.readFile(filePath);
  const base64 = fileContent.toString('base64');
  try {
    const response = await fetch('https://cvparser.ai/api/v3/parse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.CV_PARSER,
      },
      body: JSON.stringify({base64}),
    });
    const data = await response.json();
    console.log('Here is the parsed resume: ', data);
    const parsedName = 'tmpParsedResume.json';
    const writePath = path.resolve(__dirname, '../../parsed/', parsedName);
    const parsedString = JSON.stringify(data);
    await fs.writeFile(writePath, parsedString);
    return res.status(200).json(data);
  } catch (err) {
    console.error('Failed to scan resume with error: ', err);
    return res.status(400).json({status: 'error', msg: 'failed to pass to resume scanner API'});
  }
};

const tmpSkills = async (req, res) => {
  //using the stored resume object to reduce paid api calls
  const filePath = path.resolve(__dirname, '../../parsed/', 'tmpParsedResume.json');
  fsAsync.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return res / stauts(400).json({status: 'error', msg: 'failed to parse resume'});
    }

    try {
      const jsonData = JSON.parse(data);
      //get the skills array and add the additional data points will blanks
      const resumeObj = {};
      //get the professional summary
      const summary = jsonData.data.profile.basics.summary;
      const skillsArr = [];
      for (const skill of jsonData.data.profile.basics.skills) {
        const tmpSkillObj = {};
        tmpSkillObj.name = skill;
        tmpSkillObj.level = 0;
        tmpSkillObj.yearsExp = 0;
        tmpSkillObj.validated = false;
        skillsArr.push(tmpSkillObj);
      }
      // get the education data
      const educationArr = [];
      for (const edu of jsonData.data.profile.educations) {
        const tmpEduObj = {};
        tmpEduObj.qualification = edu.description;
        tmpEduObj.institution = edu.issuing_organization;
        tmpEduObj.endYear = edu.end_year;
        educationArr.push(tmpEduObj);
      }
      // get work experience
      const experienceArr = [];
      for (const role of jsonData.data.profile.professional_experiences) {
        const tmpExpObj = {};
        tmpExpObj.title = role.title;
        tmpExpObj.company = role.company;
        tmpExpObj.startDate = role.start_date;
        tmpExpObj.endDate = role.end_date;
        tmpExpObj.details = role.description;
        experienceArr.push(tmpExpObj);
      }
      //get the training/certs
      const trainingArr = [];
      for (const cert of jsonData.data.profile.trainings_and_certifications) {
        const tmpCertObj = {};
        tmpCertObj.name = cert.description;
        tmpCertObj.institution = cert.issuing_organization;
        tmpCertObj.year = cert.year;
        trainingArr.push(tmpCertObj);
      }
      console.log(trainingArr);
      //combine results for return array
      const fullResumeDetailsObj = {
        summary: summary,
        skills: skillsArr,
        education: educationArr,
        certifications: trainingArr,
        experience: experienceArr,
      };
      return res.status(200).json(fullResumeDetailsObj);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return; // Handle parsing error appropriately
    }
  });
};

module.exports = {scanResume, scanResumeCVPP, tmpSkills};
