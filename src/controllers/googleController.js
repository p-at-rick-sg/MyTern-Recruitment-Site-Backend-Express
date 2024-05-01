const {OAuth2Client} = require('google-auth-library');
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();
const {userLookup, setupJwt} = require('./authController');

const postGoogleAuthURL = async (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  const redirectUrl = process.env.AUTH_REDIRECT_URL;
  const oAuth2Client = new OAuth2Client(
    process.env.AUTH_CLIENT_ID,
    process.env.AUTH_CLIENT_SECRET,
    redirectUrl
  );
  //create the url params to end to the client
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'https://www.googleapis.com/auth/userinfo.profile email openid',
    prompt: 'consent', //maybe change to reconsent?
  });
  res.json({url: authorizeUrl});
};

//Request the user info from Google
const getGoogleUserData = async (req, res) => {
  const code = req.query.code;
  const client = await db.pool.connect();
  try {
    const redirectUrl = process.env.AUTH_REDIRECT_URL;
    const oAuth2Client = new OAuth2Client(
      process.env.AUTH_CLIENT_ID,
      process.env.AUTH_CLIENT_SECRET,
      redirectUrl
    );
    const response = await oAuth2Client.getToken(code);
    await oAuth2Client.setCredentials(response.tokens);
    console.log('Tokens Acquired');
    const user = oAuth2Client.credentials;
    const response2 = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${user.access_token}`
    );
    const data = await response2.json();
    // console.log(data);
    //if the email is not verified we drop the auth and reject
    if (data.email_verified !== true) {
      return res.status(400).json({status: 'error', msg: 'email not verified by google (1)'});
    }
    //lookup internal user details BASIC
    const queryString = `
    SELECT id FROM users WHERE email = $1
    `;
    const params = [data.email];
    const checkExisting = await client.query(queryString, params);
    if (checkExisting.rowCount !== 0) {
      console.info('email found in database');
      const auth = await userLookup(data.email);
      const type = auth.rows[0].name;
      const userId = auth.rows[0].id;
      //get the user role if corp type
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
      //setupi the claims
      const claims = {
        email: data.email,
        type: type, //how do we get this from here
        role: roleName, //TODO: add role here for the corp/recr type only as user always = user/standard
        id: userId,
      };
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
      console.log(tokens.access);

      res
        .cookie('accessToken', tokens.access, {
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 30,
        })
        .redirect('http://localhost:5173/oauth-success');
    } else {
      return res.status(400).json({status: 'error', msg: 'google auth failed (2)'});
    }
  } catch (err) {
    console.error(err);
    return res.status(400).json({status: 'error', msg: 'google auth failed (3)'});
  }
};
module.exports = {postGoogleAuthURL, getGoogleUserData};
