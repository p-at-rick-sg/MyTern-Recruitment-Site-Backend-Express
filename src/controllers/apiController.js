const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

const getSectors = async (req, res) => {
  const client = await db.pool.connect();
  console.log('get sectors running');
  try {
    const queryString = `
        SELECT (sector)
        FROM company_sector
        ORDER BY sector
        `;
    const sectorsResult = await client.query(queryString);
    console.log(sectorsResult);
    const returnArr = [];
    for (const item of sectorsResult.rows) {
      returnArr.push(item.sector);
    }
    const returnObj = {};
    returnObj.data = returnArr;
    return res.status(200).json(returnObj);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  }
};

const getCountries = async (req, res) => {};

const getPostcodes = async (req, res) => {};

module.exports = {getSectors, getCountries, getPostcodes};
