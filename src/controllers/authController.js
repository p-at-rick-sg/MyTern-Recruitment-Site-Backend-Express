const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
//Database connection
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

const checkExistingEmail = async email => {
  try {
    const client = await db.pool.connect(); // Use the connection pool
    //Find the user by email in the db as this will be a duplicate and cannot register again
    const checkExisting = await client.query(`SELECT id FROM users WHERE email = '${email}'`);
    if (checkExisting.rowCount !== 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error('failed to lookup user in db with error: ', err);
    return res.status(400).json({status: 'error', msg: 'error checking email'});
  }
};

const signup = async (req, res) => {
  const email = req.body.email;
  const existing = await checkExistingEmail(email);
  if (existing) {
    return res.status(400).json({
      status: 'error',
      msg: 'duplicate email',
    });
  }

  //Create the password hash
  const passwordHash = await bcrypt.hash(req.body.password, 12);
  //TODO: cleanse the input data in middlewarwe later
  firstName = req.body.firstName;
  lastName = req.body.lastName;
  const client = await db.pool.connect();
  try {
    client.query('BEGIN;');
    const insertUserResult = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, firstName, lastName]
    );
    console.log(insertUserResult);
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
        const country = req.body.country.name;
        countryId = req.body.country.id;
        const address2 = {};
        if ('address2' in req.body) address2.name = req.body.address2;
        console.log('country deets: ', countryId, country);
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
        console.log('address already existed - add some logic to handle!');
        return res.status(400).json({status: 'error', msg: 'email already exists'});
      }
      // if ('telephone' in req.body) newUser.telephone = req.body.telephone;
      // if ('role' in req.body) newUser.role = req.body.role;
      res.status(200).json({status: 'ok', msg: 'user registered successfully'});
      client.query('COMMIT;');
    }
  } catch (err) {
    console.log(err.message);
    res.status(400).json({status: 'error', msg: 'failed registration'});
  } finally {
    console.info('releasing the client');
    client.release();
  }
};

const checkExistingDomain = async params => {
  try {
    const client = await db.pool.connect();
    const queryString = `
    SELECT id 
    FROM companies
    WHERE primary_domain = $1
    `;
    const checkExisting = await client.query(queryString, params);
    if (checkExisting.rowCount === 0) {
      return false;
    } else return true;
  } catch (err) {
    console.error('failed to validate domain');
  }
};

const corpSignup = async (req, res) => {
  console.log(req.body);
  const domain = req.body.primaryDomain;
  const countryId = req.body.country.id;
  // to validate the domain is unique/stop multiple signups of same company
  const existing = await checkExistingDomain([domain]);
  console.info('existing domain result: ', existing);
  if (existing) {
    return res.status(400).json({
      status: 'error',
      msg: 'domain already registered',
    });
  } else {
    const client = await db.pool.connect();
    try {
      client.query('BEGIN;');
      const passwordHash = await bcrypt.hash(req.body.password, 12);
      //START THE SQL MASSACRE
      const insertQuery = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;
      const params = [req.body.firstName, req.body.lastName, req.body.email, passwordHash];

      const res1 = await client.query(insertQuery, params);
      const newUserId = res1.rows[0].id;
      console.info('new user id: ', newUserId);
      //quickly insert the user type link entry
      await client.query('INSERT INTO user_type_link (user_id, type_id) VALUES ($1, $2)', [
        newUserId,
        2,
      ]); //type 2 for corporate user
      const insertQuery2 = `INSERT INTO companies (name, primary_domain, total_employees, root_user_id) VALUES ($1, $2, $3, $4) RETURNING id;`;
      const params2 = [
        req.body.companyName,
        req.body.primaryDomain,
        req.body.totalEmployees,
        newUserId,
      ];
      console.log(insertQuery2, params2);
      const res2 = await client.query(insertQuery2, params2);
      console.log('res2 neat', res2);
      const newCompanyId = res2.rows[0].id;
      console.info('new company id: ', newCompanyId);
      const insertQuery3 = `
        INSERT INTO addresses (address1, address2, city, postcode, country_id) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id;
        `;
      const params3 = [
        req.body.address1,
        req.body.address2 || '',
        req.body.city,
        req.body.postcode,
        countryId,
      ];
      const res3 = await client.query(insertQuery3, params3);
      const newAddressId = res3.rows[0].id;
      console.log('address id: ', newAddressId, 'company id', newCompanyId, 'userid', newUserId);

      const insertQuery4 = `INSERT INTO company_offices (company_id, primary_contact_id, address_id) VALUES ($1, $2, $3) RETURNING id;`;
      const params4 = [newCompanyId, newUserId, newAddressId];
      const res4 = await client.query(insertQuery4, params4);
      newOfficeId = res4.rows[0].id;
      // FIX THIS N THE FE
      // const sectorResult = await client.query('SELECT id FROM company_sectors WHERE sector = $1;', [
      //   req.body.companySector,
      // ]);
      const sectorId = req.body.companySector.id;
      const insertQuery5 = `INSERT INTO company_sector_link (company_id, sector_id) VALUES ($1, $2);`;
      const params5 = [newCompanyId, sectorId];
      const res5 = await client.query(insertQuery5, params5);
      //finally add the company_user_link info (admin is ID 1)
      const insertQuery6 = `INSERT INTO company_users_link (user_id, company_id, office_id, role_id, position) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
      const params6 = [newUserId, newCompanyId, newOfficeId, 1, req.body.position]; //admin is role id 1
      const finalRes = await client.query(insertQuery6, params6);
      if (finalRes.rows[0].id !== null) {
        client.query('COMMIT;');
        console.info('completed new company and admin user setup');
        return res.status(200).json({status: 'ok', msg: 'user and company created'});
      } else {
        console.error('failed to complete the insert sequence');
        await client.query('ROLLBACK;');
      }
    } catch (err) {
      await client.query('ROLLBACK;');
      console.error('failed to complete the db transaction with error: ', err);
    } finally {
      console.info('closing the client connection');
      client.release();
    }
  }
  //invite the users added at the end
};

const signin = async (req, res) => {
  try {
    const email = req.body.email;
    const client = await db.pool.connect(); // Use the connection pool
    console.log(email);

    // const queryString = `
    // SELECT users.id, users.password_hash, user_types.name
    // FROM users
    // INNER JOIN user_type_link ON users.id =user_type_link.user_id
    // INNER JOIN user_types ON user_type_link.type_id = user_types.id
    // WHERE email = $1
    // `;
    // const params = [email];
    // const auth = await client.query(queryString, params);
    const auth = await userLookup(email);
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
      role: 'temp role for now', //TODO: add role here for comp/recr type
      id: auth.rows[0].user_id,
    };

    const tokens = await setupJwt(claims);
    //testing the cookie setting from standard page with no redirect
    console.log('setting cookie');
    res.cookie('accessToken', tokens.access, {
      httpOnly: true, // Mark the cookie as HttpOnly so the client cannot read it direclty
      secure: true, // Add secure flag if using HTTPS (recommended)
      maxAge: 1000 * 60 * 30, // Set cookie expiration (matches token expiry - change back to 30 later )
    });
    // return res.status(200).json(tokens);
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

module.exports = {signup, signin, refresh, setupJwt, userLookup, corpSignup, checkExistingEmail};
