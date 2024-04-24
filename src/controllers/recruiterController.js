require('dotenv').config();
const {Storage} = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');
const bcrypt = require('bcrypt');
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();
const {checkExistingEmail} = require('../controllers/authController');

const uploadToGCP = async (file, fileOutputName) => {
  try {
    const storage = new Storage();
    const bucket = storage.bucket(process.env.BUCKET_NAME);
    const result = await bucket.upload(file, {
      destination: fileOutputName,
    });
    return result;
  } catch (err) {
    console.error(err.message);
  }
};

const deleteFile = async filePath => {
  try {
    result = await fs.unlink(filePath);
    console.log(`File ${filePath} has been deleted.`);
    return result;
  } catch (err) {
    console.error(err);
  }
};

const uploadAsset = async (req, res) => {
  try {
    const fileSuffix = req.file.originalname.split('.').pop();
    const fileName = req.file.filename + '.' + fileSuffix;
    console.log('here is the desc emelemnt: ', req.file);
    const fileDescription = req.file.imageDescription || 'Default Image Description';
    const result = await uploadToGCP(req.file.path, fileName);
    if (result[0].id) {
      //compose the full url
      const imageURI = process.env.IMAGE_BASE_URI + result[0].id;
      //remove the image from the local storage
      const filePath = path.resolve('uploads/', req.file.filename);
      deleteFile(filePath);
      //add the URL to the project model (need tp pull the project ID - add manually for testing)
      dbResult = await ProjectModel.findByIdAndUpdate(req.params.projectID, {
        $push: {images: {URL: imageURI, description: fileDescription}}, //need to add the desc from body
      });
      console.log(dbResult);
      //return the URL path for the caller
      return res.status(200).json({
        status: 'ok',
        msg: 'file upload successful',
        fileURL: imageURI,
      });
    } else {
      return res.status(400).json({status: 'error', msg: 'file upload failed'});
    }
  } catch (err) {
    console.error('Error: ', err);
    return res.status(400).json({status: 'error', msg: 'file upload failed with error'});
  }
};

function generatePassword(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = ' ';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const inviteCompanyUser = async (req, res) => {
  //change doma later t be looked up locally?
  const user = req.body.user;
  const domain = req.body.domain;
  //check existing user and correct domain
  const exists = await checkExistingEmail(user.email);
  if (!exists && user.email.includes(domain)) {
    console.info('inviting: ', user.email);
    const password = generatePassword(8); //keep to send to the email for the user
    const passwordHash = await bcrypt.hash(password, 12);
    const client = await db.pool.connect(); // Use the connection pool
    try {
      client.query('BEGIN;');
      const insertQuery1 = `INSERT INTO users (email, first_name, last_name, password_hash) VALUES ($1, $2, $3, $4) RETURNING id;`;
      const params1 = [user.email, user.firstName, user.lastName, passwordHash];
      const newUserResult = await client.query(insertQuery1, params1);
      const newUserId = newUserResult.rows[0].id;
      console.log(newUserId);
      return res.status(200).json({status: 'ok', msg: `added user ID: ${newUserId}`});
    } catch (err) {
      console.error('failed to add users: ', err);
      client.query('ROLLBACK;');
      return res.status(400).json({status: 'error', msg: 'error adding users'});
    } finally {
      console.info('commiting & releasing client');
      client.query('COMMIT;');
      client.release();
    }
  } else {
    //the user is not valid - we wil not invite
    console.info('invalid user - not being invited');
    return res.status(400).json({status: 'error', msg: 'error adding users'});
    client.release();
  }
};

module.exports = {
  uploadAsset,
  inviteCompanyUser,
};
