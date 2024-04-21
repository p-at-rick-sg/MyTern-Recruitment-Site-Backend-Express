const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
//Database connection
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

const signup = async (req, res) => {
  const email = req.body.email;
  try {
    const client = await db.pool.connect(); // Use the connection pool
    //Find the user by email in the db as this will be a duplicate and cannot register again
    const checkExisting = await client.query(`SELECT id FROM users WHERE email = '${email}'`); //remove string concatenation later
    if (checkExisting.rowCount !== 0) {
      return res.status(400).json({
        status: 'error',
        msg: 'duplicate username/user already registered',
      });
    }
    //Create the local password hash
    const passwordHash = await bcrypt.hash(req.body.password, 12);

    //cleanse the input data in middlewarwe later
    firstName = req.body.firstName;
    lastName = req.body.lastName;
    const insertUserResult = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, firstName, lastName]
    );
    if (insertUserResult.rows[0]) {
      console.log('we have the user ID OK');
      const userId = insertUserResult.rows[0].id;
      //add the user type - default will be 1 - normal user
      const userTypeId = 1;
      await client.query('INSERT INTO user_type_link (user_id, type_id) VALUES ($1, $2)', [
        userId,
        userTypeId,
      ]);
      //insert the address - check for exising postcode
      const postcode = req.body.postcode;
      const checkExistingPostcode = await client.query(
        'SELECT id from addresses WHERE postcode = $1',
        [postcode]
      );
      if (checkExistingPostcode.rowCount === 0) {
        console.log('no postcodes matching so we move to add address');
        // go ahead and add the new address and get the id
        const address1 = req.body.address1;
        const city = req.body.city;
        const country = req.body.country;
        const address2 = {};
        if ('address2' in req.body) address2.name = req.body.address2;

        //get country ID
        const countryResult = await client.query('SELECT id FROM countries WHERE name = $1', [
          country,
        ]);
        const countryId = countryResult.rows[0].id;
        console.log('country id: ', countryId);
        const insertAddressResult = await client.query(
          'INSERT INTO addresses (address1, address2, city, postcode, country_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [address1, 'test add2', city, postcode, countryId]
        );
        console.log('address id: ', insertAddressResult.rows[0].id);
        const addressId = insertAddressResult.rows[0].id;
        const linkUserAddressResult = await client.query(
          'INSERT INTO user_address_link (user_id, address_id, address_type) VALUES ($1, $2, $3)',
          [userId, addressId, 'primary']
        );
      } else {
        // get the existing id but we won't add this for now as we don't ahve any addresses it won;t cause an issue yet
        console.log('address already existed - add some logic to handle now!');
      }

      //add optional elements to the object - NOT USING YET and objects won't work here
      if ('telephone' in req.body) newUser.telephone = req.body.telephone;
      if ('role' in req.body) newUser.role = req.body.role;

      res.status(200).json({status: 'ok', msg: 'user registered successfully'});
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({status: 'error', msg: 'failed registration'});
  }
};

const signin = async (req, res) => {
  try {
    const email = req.body.email;
    const client = await db.pool.connect(); // Use the connection pool
    console.log(email);
    const queryString = `
    SELECT users.id, users.password_hash, user_types.name
    FROM users
    INNER JOIN user_type_link ON users.id =user_type_link.user_id
    INNER JOIN user_types ON user_type_link.type_id = user_types.id
    WHERE email = $1
    `;
    const params = [email];
    const auth = await client.query(queryString, params);

    if (auth.rowCount === 0) {
      return res.status(400).json({
        status: 'error',
        msg: 'not authorized',
      });
    }
    //compare the password hash against stored hash
    const result = await bcrypt.compare(req.body.password, auth.rows[0].password_hash);

    if (!result) {
      console.log('incorrect password');
      return res.status(400).json({status: 'not ok', msg: 'failed login'});
    }
    //if we get here login succeeded so we set up the jwt
    const claims = {
      email: email,
      type: auth.rows[0].name,
      role: 'temp role for now', //TODO: add role here for coprp/recr type
      id: auth.rows[0].user_id,
    };

    const tokens = await setupJwt(claims);

    return res.status(200).json(tokens);
  } catch (err) {
    console.error('failed login after password check');
    return res.status(400).json({error: err, msg: 'Other failed login error'});
  }
};

const userLookup = async email => {
  try {
    const client = await db.pool.connect(); // Use the connection pool
    console.log(email);
    const queryString = `
    SELECT users.id, users.password_hash, user_types.name
    FROM users
    INNER JOIN user_type_link ON users.id =user_type_link.user_id
    INNER JOIN user_types ON user_type_link.type_id = user_types.id
    WHERE email = $1
    `;
    const params = [email];
    const auth = await client.query(queryString, params);
    return auth;
  } catch (err) {
    console.error('failed user lookup');
    return {status: 'error', message: 'failed uper lookup'};
  }
};
//moved to separate functio as we will be reusing it for google and any other auth providers too
const setupJwt = async claims => {
  const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
    expiresIn: '7d',
    //store this in the database as an access type
    jwtid: uuidv4(),
  });
  const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
    expiresIn: '30d',
    //store this in the database as a refresh type
    jwtid: uuidv4(),
  });
  return {access, refresh};
};

const refresh = async (req, res) => {
  try {
    const decoded = jwt.verify(req.body.refresh, process.env.REFRESH_SECRET);
    //add the claims values
    const claims = {
      email: decoded.email,
      role: decoded.role,
    };
    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: '30m',
      jwtid: uuidv4(),
    });
  } catch (err) {
    console.error('failed to refresh token: ', err.message);
    return res.status(400).json({status: 'error', msg: 'token refresh failed with error'});
  }
};

module.exports = {signup, signin, refresh, setupJwt, userLookup};
