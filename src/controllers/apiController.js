const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();
const validator = require('email-validator');

const getSectors = async (req, res) => {
  const client = await db.pool.connect();
  console.log('get sectors running');
  try {
    const queryString = `
        SELECT sector, id
        FROM company_sectors
        ORDER BY sector
        `;
    const sectorsResult = await client.query(queryString);

    console.log('returning: ', sectorsResult.rows);
    return res.status(200).json(sectorsResult.rows);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  } finally {
    client.release();
  }
};

const getCountries = async (req, res) => {
  const client = await db.pool.connect();
  console.log('get coutries running');
  try {
    const queryString = `
        SELECT name, id
        FROM countries
        ORDER BY name
        `;
    const countriesResult = await client.query(queryString);
    console.log('returning: ', countriesResult.rows);
    return res.status(200).json(countriesResult.rows);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  } finally {
    client.release();
  }
};

const getPostcodes = async (req, res) => {};

const getSkills = async (req, res) => {
  console.log('staritng full skills enum func');
  const client = await db.pool.connect();
  try {
    console.log('in the try');
    const skillsResult = await client.query(
      'SELECT skill_id, skill_name FROM skills ORDER BY skill_name;'
    );
    const cleansedResult = skillsResult.rows;
    console.log(cleansedResult);
    console.log('have result');
    return res.status(200).json(cleansedResult);
  } catch (err) {
    console.error('Error fetching skills with error: ', err);
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  } finally {
    client.release();
  }
};

const whoAmI = async (req, res) => {
  console.log('in the whoami function');
  console.log('we have token: ', req.decoded);
  if (validator.validate(req.decoded.email)) {
    const client = await db.pool.connect(); //keep outside the try as it cause all sorts of wierd stuff inside
    try {
      // run the lookups to get the required info
      const result = await client.query('SELECT first_name FROM users WHERE email = $1;', [
        req.decoded.email,
      ]);
      const returnObj = {
        email: req.decoded.email,
        firstName: result.rows[0].first_name,
        id: req.decoded.id,
        type: req.decoded.type,
        role: req.decoded.role,
        exp: req.decoded.exp,
      };
      console.log(returnObj);
      return res.status(200).json(returnObj);
    } catch {
      return res.status(400).json({status: 'error', msg: 'cannot return user details (1)'});
    } finally {
      client.release();
    }
    res.status(200).json({status: 'ok', msg: 'got to the protected route'});
  } else {
    return res.status(400).json({status: 'error', msg: 'invalid email format'});
  }
};

module.exports = {getSectors, getCountries, getPostcodes, getSkills, whoAmI};
