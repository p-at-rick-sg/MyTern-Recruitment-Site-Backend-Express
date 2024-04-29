const {DocumentProcessorServiceClient} = require('@google-cloud/documentai').v1;
const path = require('path');
const fs = require('fs');
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

const projectId = 'ga-project-4-420504';
const location = 'us';
const processorId = '9fcf1ab279afbca3';

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

const scanResumeCVPP = async (req, res) => {
  //TODO write to parsed with uniquie filename of username + date perhpas
  console.log('CV Parser Resume Scanner Running');
  const fileName = req.body.fileName;
  const userId = req.body.userId;
  console.log('passed filename: ', fileName, ' Passed userId: ', userId);
  const filePath = path.resolve(__dirname, '../../uploads/', fileName);
  const fileContent = await fs.promises.readFile(filePath);
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
    // console.log('Here is the parsed resume: ', data);
    const parsedName = userId + '.json';
    const writePath = path.resolve(__dirname, '../../parsed/', parsedName);
    const parsedString = JSON.stringify(data);
    await fs.promises.writeFile(writePath, parsedString);
    //now call the format funtion to put required data into nice format
    console.log('calling the format function');
    const formatedResumeObj = await formatResumeData(parsedName); //for testing we will use the set path with resume already scanned - UPDATE LATER
    // now send for database insertion with object and userID
    console.log('calling the db insert function');
    const dbResult = await writeResumeToDb(formatedResumeObj, userId);
    console.log('after the db function');
    //return the original formatted object to the client after all the db stuff
    return res.status(200).json(formatedResumeObj);
  } catch (err) {
    console.error('Failed to scan resume with error: ', err);
    return res.status(400).json({status: 'error', msg: 'failed to pass to resume scanner API'});
  }
};

const formatResumeData = async fileName => {
  console.log('in the format function');
  //using the stored resume object to reduce paid api calls
  const filePath = path.resolve(__dirname, '../../parsed/', fileName);
  try {
    console.log('trying the inserts');
    const data = await fs.promises.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    //get the skills array and add the additional data points will blanks
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
    const finalResumeObj = {
      summary: summary,
      skills: skillsArr,
      education: educationArr,
      certifications: trainingArr,
      experience: experienceArr,
    };
    console.log('returning this object: ', finalResumeObj);
    return finalResumeObj; //change this to pass internally for database insertion
  } catch (parseError) {
    console.error('Error parsing JSON:', parseError);
    return false;
  }
};

const writeResumeToDb = async (resumeObj, userId) => {
  console.log('here is the object passed to the db function: ', resumeObj);
  //write the formatted data to the db (for now we will also allow unformatted skills TODO: fuzzy matching/creating new)
  const client = await db.pool.connect(); // Use the connection pool
  try {
    console.log('starting the inserts');
    client.query('BEGIN;');
    // INSERT summary to user
    const summaryQuery = `UPDATE users
    SET summary = $1
    WHERE id = $2`;
    const summaryParams = [resumeObj.summary, userId];
    await client.query(summaryQuery, summaryParams);
    // check skills in skills table and add if not there (will be fuzzy later)

    for (const skill of resumeObj.skills) {
      const skillName = skill.name.toLowerCase();
      try {
        //lookup skill and return the skill id OR inseert the skill and return the skill id
        const skillQuery = `INSERT INTO skills (skill_name)
VALUES ($1)
ON CONFLICT (skill_name) DO UPDATE SET skill_name = EXCLUDED.skill_name
RETURNING skill_id;`;
        const skillParams = [skillName];
        const skillInsert = await client.query(skillQuery, skillParams);
        const skillId = skillInsert.rows[0].skill_id;
        console.log('skill id is: ', skillId);
        // now add to the user_skills_link
        const skillLinkQuery = `INSERT INTO user_skills_link (skill_id, user_id)
VALUES ($1, $2)
ON CONFLICT (skill_id, user_id) DO NOTHING;`;
        const skillLinkParams = [skillId, userId];
        await client.query(skillLinkQuery, skillLinkParams);
      } catch (err) {
        console.error('Error processing skill:', skill.name, error);
      }
    }
    //add the work experiences to the work_experience table
    for (const role of resumeObj.experience) {
      //get date from year and month for start and end
      const startDate = new Date(role.startDate.year, role.startDate.month, 2);
      const startDateStr = startDate.toISOString().slice(0, 10);
      const endDate = new Date(role.endDate.year, role.endDate.month, 1);
      const endDateStr = endDate.toISOString().slice(0, 10);
      const experienceQuery = `INSERT INTO work_Experience (user_id, company_name, title, start_date, details, end_date)
        VALUES ($1, $2, $3, $4, $5, $6);`;
      const experienceParams = [
        userId,
        role.company,
        role.title,
        startDateStr,
        role.details,
        endDateStr || null,
      ];
      await client.query(experienceQuery, experienceParams);
    }
    //certifications to be inserted
    for (const cert of resumeObj.certifications) {
      console.log('running certifications');
      const certsQuery = `INSERT INTO certifications (user_id, name, institution, year) VALUES ($1, $2, $3, $4);
        `;
      const certsParams = [userId, cert.name, cert.institution || null, cert.year || null];
      await client.query(certsQuery, certsParams);
    }
    for (const edu of resumeObj.education) {
      const eduInsertQueryString = `INSERT INTO education (user_id, institution, qualification, graduation_year)
        VALUES ($1, $2, $3, $4);`;
      const eduParams = [
        userId,
        edu.institution.toLowerCase(),
        edu.qualification.toLowerCase(),
        edu.endYear,
      ];
      await client.query(eduInsertQueryString, eduParams);
    }
    //complete the session and commit after all stpes are successful
    console.info('query completed successfully - committing');
    client.query('COMMIT;');
    return true;
  } catch (err) {
    client.query('ROLLBACK;');
    console.error('failed to write resume data to the db', err);
    return false;
  } finally {
    client.release();
  }
};

module.exports = {scanResume, scanResumeCVPP, formatResumeData};
