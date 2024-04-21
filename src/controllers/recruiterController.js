require('dotenv').config();
const {Storage} = require('@google-cloud/storage');
const fs = require('fs').promises;
const path = require('path');

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

module.exports = {
  uploadAsset,
};
