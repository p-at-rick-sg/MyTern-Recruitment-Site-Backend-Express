//Document AI Setup
const {DocumentProcessorServiceClient} = require('google-cloud/documentai');
const projectID = 'ga-project-4-420504';

const bcrypt = require('bcrypt');

const {addDays, subDays, format} = require('date-fns');

const seedTalent = async (req, res) => {
  try {
    return res.status(200).json({status: 'ok', msg: 'Talent seeding successful'});
  } catch (err) {
    console.error(err.message);
    return res.status(400).json({status: 'error', msg: 'Talent seeding failed'});
  }
};

const seedManyTalent = async (req, res) => {
  console.log('Seeding Talents...');
  try {
    const Talents = [];
    const roles = ['contributor', 'Talent'];
    const currentDate = new Date();

    for (let i = 0; i < Math.floor(Math.random() * 100) + 100; i++) {
      const randomDaysAgo = Math.floor(Math.random() * 365); // Random days up to a year ago
      const createdDate = subDays(currentDate, randomDaysAgo);
      const passwordHash = await bcrypt.hash('password', 12);
    }

    await TalentModel.create(Talents);
    console.log(`Seeded ${Talents.length} Talents.`);
    return res
      .status(200)
      .json({status: 'ok', msg: `${Talents.length} Talents seeded successfully`});
  } catch (err) {
    console.error('Error seeding Talents:', err.message);
    return res.status(400).json({status: 'error', msg: 'Talent seeding failed'});
  }
};

const getTalent = async (req, res) => {
  try {
    res.status(200).json(result);
  } catch (err) {
    console.error('failed to get Talent details');
    return res.status(400).json({error: err, msg: 'cannot retieve Talent details'});
  }
};

const updateTalent = async (req, res) => {
  const updatedTalent = {};
  if ('firstName' in req.body) updatedTalent.firstName = req.body.firstName;
  if ('lastName' in req.body) updatedTalent.lasstName = req.body.lastName;
  if ('address1' in req.body) updatedTalent.address1 = req.body.address1;
  if ('address2' in req.body) updatedTalent.address2 = req.body.address2;
  if ('town' in req.body) updatedTalent.town = req.body.town;
  if ('country' in req.body) updatedTalent.country = req.body.country;
  if ('postcode' in req.body) updatedTalent.postcode = req.body.postcode;
  if ('active' in req.body) nupdatedTalent.active = req.body.active;
  if ('role' in req.body) updatedTalent.role = req.body.role;
  if ('telephone' in req.body) updatedTalent.telephone = req.body.telephone;
  console.log(req.body);
  if (req.decoded.role === 'admin' && req.query.TalentID) {
    try {
      console.log(`updating Talent ID: ${req.query.TalentID} for admin use`);
      //add new db logic here
      return res.status(200).json(result);
    } catch (err) {
      console.error(err.message);
      return res.status(200).json({status: 'error', msg: 'failed to update Talent'});
    }
  } else {
    try {
      console.log(`updating Talent ID: ${req.decoded.id} for end Talent`);
      // add new db logic here
      return res.status(200).json(result);
    } catch (err) {
      console.error(err.message);
      return res.status(200).json({status: 'error', msg: 'failed to update Talent'});
    }
  }
};

const getAllTalent = async (req, res) => {
  try {
    // add new db logic here
    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({status: 'error', msg: 'failed to retrieve all Talents'});
  }
};

const deleteTalentById = async (req, res) => {
  try {
    //add new db logic here
    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({status: 'error', msg: 'failed to delete Talent by id'});
  }
};

const updateTalentById = async (req, res) => {
  const updatedTalent = {};
  if ('firstName' in req.body) updatedTalent.firstName = req.body.firstName;
  if ('lastName' in req.body) updatedTalent.lastName = req.body.lastName;
  if ('role' in req.body) updatedTalent.role = req.body.role;
  if ('active' in req.body) updatedTalent.active = req.body.active;
  try {
    //add new db logic here
    return res.status(200).json(result);
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({status: 'error', msg: 'failed to update Talent by id'});
  }
};

module.exports = {
  seedTalent,
  getTalent,
  getAllTalent,
  updateTalent,
  deleteTalentById,
  updateTalentById,
};
const countTalentsByRole = async (req, res) => {
  const {role} = req.query; // Assume role is passed as a query parameter, e.g., /api/Talents/count?role=Talent
  try {
    // Count documents where the role matches the query parameter
    //add new db logic here
    return res.status(200).json({
      status: 'success',
      role: role,
      count: count,
    });
  } catch (error) {
    console.error(error.message);
    return res.status(400).json({
      status: 'error',
      msg: `Failed to retrieve count for role: ${role}`,
    });
  }
};

module.exports = {
  seedTalent,
  seedManyTalent,
  getTalent,
  getAllTalent,
  updateTalent,
  countTalentsByRole,
  deleteTalentById,
  updateTalentById,
};
