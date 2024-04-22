//Document AI Setup
// const {DocumentProcessorServiceClient} = require('google-cloud/documentai');
const projectID = 'ga-project-4-420504';
const bcrypt = require('bcrypt');
const {addDays, subDays, format} = require('date-fns');

const simpleGet = (req, res) => {
  console.log('sending the test protected reponse');
  return res.status(200).json({msg: 'test response'});
};

module.exports = {
  simpleGet,
};
