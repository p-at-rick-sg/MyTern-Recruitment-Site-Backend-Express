const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

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
  }
};

const getPostcodes = async (req, res) => {};

module.exports = {getSectors, getCountries, getPostcodes};
