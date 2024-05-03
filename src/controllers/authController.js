const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');
//Database connection
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

const checkExistingEmail = async email => {
  const client = await db.pool.connect(); // Use the connection pool
  try {
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
  } finally {
    client.release();
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
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const client = await db.pool.connect();
  try {
    client.query('BEGIN;');
    const insertUserResult = await client.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, passwordHash, firstName, lastName]
    );
    if (insertUserResult.rows[0]) {
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
        countryId = req.body.country.id;
        let address2 = '';
        if ('address2' in req.body) address2 = req.body.address2;
        const insertAddressResult = await client.query(
          'INSERT INTO addresses (address1, address2, city, postcode, country_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
          [address1, address2 || '', city, postcode, countryId]
        );
        const addressId = insertAddressResult.rows[0].id;
        await client.query(
          'INSERT INTO user_address_link (user_id, address_id, address_type) VALUES ($1, $2, $3)',
          [userId, addressId, 'primary']
        );
      } else {
        // get the existing id but we won't add this for now as we don't ahve any addresses it won't cause an issue yet
        console.log('address already existed - add some logic to handle!');
        return res.status(400).json({status: 'error', msg: 'email already exists'});
      }
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
  const client = await db.pool.connect();
  try {
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
  } finally {
    client.release();
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

      const sectorId = req.body.companySector.id;
      const insertQuery5 = `INSERT INTO company_sector_link (company_id, sector_id) VALUES ($1, $2);`;
      const params5 = [newCompanyId, sectorId];
      await client.query(insertQuery5, params5);
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

const signout = async (req, res) => {
  //remove all access tokens and the session
  const accessToken = req.cookies.accessToken;
  email = req.body.email;
  if (!accessToken) {
    console.info('no access token for signout - checking body for email');
    if (!email) {
      console.error('no email to signout - returning');
      return res.status(400).json({status: 'error', msg: 'no valid id to signout'});
    }
  } else {
    const client = await db.pool.connect();
    try {
      client.query('BEGIN;');
      const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
      const getSessionIdString = `SELECT id FROM sessions WHERE user_id = $1;`;
      const getSessionIdParams = [decoded.id];
      const sessionQueryResult = await client.query(getSessionIdString, getSessionIdParams);
      const sessionId = sessionQueryResult?.rows[0].id;
      //delete all access tokens form the id
      const tmp = await client.query(`DELETE FROM access_tokens WHERE session_id = $1;`, [
        sessionId,
      ]);
      //Delete the session too
      const tmp2 = await client.query(`DELETE FROM sessions WHERE id = $1;`, [sessionId]);
      client.query('COMMIT;');
      return res.status(200).json({status: 'ok', msg: 'logged out all sessions from server'});
    } catch (err) {
      console.error('signout failed', err);
      client.query('ROLLBACK;');
      return res.status(200).json({status: 'error', msg: 'failed to sign out properly'});
    }
  }
};

const signin = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const auth = await userLookup(email);
    if (auth.rowCount === 0) {
      return res.status(400).json({
        status: 'error',
        msg: 'User not found',
      });
    }
    // Compare the password hash against the stored hash
    const result = await bcrypt.compare(password, auth.rows[0].password_hash);
    if (!result) {
      console.log('Incorrect password');
      return res.status(400).json({status: 'error', msg: 'Incorrect password'});
    }
    //check if the user is corp and if so retrieve the role name or ID
    const type = auth.rows[0].name;
    const userId = auth.rows[0].id;
    let roleName;
    if (type === 'corp') {
      try {
        //now get the corp users role for the claims
        const client = await db.pool.connect();
        const roleQueryString = `SELECT roles.name
      FROM roles
      INNER JOIN company_users_link ON company_users_link.role_id = roles.id
      WHERE user_id = $1;`;
        const roleParams = [userId];
        const roleResult = await client.query(roleQueryString, roleParams);
        roleName = roleResult.rows[0].name;
      } catch (err) {
        console.error('failed to lookup corp users role');
      }
    }
    // Setup JWT
    const claims = {
      email: email,
      type: type,
      role: roleName || null, // TODO: add role here for comp/recr type
      id: userId,
    };
    console.log('claims: ', claims);
    const tokens = await setupJwt(claims);
    const client = await db.pool.connect(); // Use the connection pool
    try {
      client.query('BEGIN;');
      //check if existing valid session then only create if none/expired
      const checkSessionString = `SELECT * FROM sessions WHERE user_id = $1;`;
      const checkSessionParams = [auth.rows[0].id];
      const sessionResult = await client.query(checkSessionString, checkSessionParams);
      if (sessionResult.rows.length !== 1) {
        //delete all sessions as we cannot handle multiple session per device just yet
        const deleteSessionString = `DELETE FROM sessions WHERE user_id = $1;`;
        const deleteSessionParams = [auth.rows[0].id];
        await client.query(deleteSessionString, deleteSessionParams);
        console.log('deleted multi-sessions');
      }
      if (sessionResult.rows.length === 1) {
        //check time validity
        const expiry = sessionResult.rows[0].expires_at;
        const nowZulu = Date.now();
        // Get the milliseconds since the Unix epoch
        const now = nowZulu.getTime();
        console.log('expiry:', expiry);
        console.log('now: ', now);
      }
      const sessionInsert = await client.query(
        `INSERT INTO sessions (user_id) VALUES ($1) RETURNING id;`,
        [auth.rows[0].id]
      );
      const sessionId = sessionInsert.rows[0].id;
      const accessInsert = await client.query(
        `INSERT INTO access_tokens (jti, session_id) VALUES ($1, $2) RETURNING id ;`,
        [tokens.accessId, sessionId]
      );
      client.query('COMMIT;');
    } catch {
      client.query('ROLLBACK;');
    } finally {
      client.release();
      console.info('released client');
    }
    console.log('Setting cookie: ', tokens.access);
    // Set cookie and redirect
    res.cookie('accessToken', tokens.access, {
      domain: 'localhost',
      httpOnly: true,
      secure: false, // Change to true in production as will be served over HTTPS
      maxAge: 1000 * 60 * 30,
      sameSite: 'Lax',
    });
    res.send({cookie: true});
  } catch (err) {
    console.error('Failed login:', err);
    return res.status(500).json({status: 'error', msg: 'Internal server error'});
  }
};

const userLookup = async email => {
  const client = await db.pool.connect(); // Use the connection pool
  try {
    console.log('user lookup func: ', email);
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
    return {status: 'error', message: 'failed user lookup'};
  } finally {
    console.info('processed login ok - closing db session');
    client.release();
  }
};

const setupJwt = async claims => {
  const accessId = uuidv4();
  const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
    expiresIn: '60m',
    //store this in the database as an access type
    jwtid: accessId,
  });
  // const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
  //   expiresIn: '30d',
  //   //store this in the database as a refresh type
  //   jwtid: uuidv4(),
  // });
  return {access, accessId};
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

module.exports = {
  signup,
  signin,
  signout,
  refresh,
  setupJwt,
  userLookup,
  corpSignup,
  checkExistingEmail,
};
