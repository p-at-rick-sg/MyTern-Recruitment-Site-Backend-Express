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
  console.log('Google Code from initial Query in url query: ', code);
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
    console.log(data);
    //if the email is not verified we drop the auth and reject
    if (data.email_verified !== true) {
      return res.status(400).json({status: 'error', msg: 'email not verified by google (1)'});
    }
    //lookup internal user details BASIC
    const client = await db.pool.connect(); // Use the connection pool
    const queryString = `
    SELECT id FROM users WHERE email = $1
    `;
    const params = [data.email];
    const checkExisting = await client.query(queryString, params);
    console.log(checkExisting);
    if (checkExisting.rowCount !== 0) {
      console.info('email found in database');
      const auth = await userLookup(data.email);
      const claims = {
        email: data.email,
        type: auth.rows[0].name, //how do we get this from here
        role: 'temp role for now', //TODO: add role here for coprp/recr type
        id: auth.rows[0].user_id,
      };
      const tokens = setupJwt(claims);
      //response with access only in a secure cookie header
      res.cookie('accessToken', accessToken, {
        httpOnly: true, // Mark the cookie as HttpOnly
        secure: true, // Add secure flag if using HTTPS (recommended)
        maxAge: 1000 * 60 * 30, // Set cookie expiration (matches token expiry)
      });
      //return the response to the client
      res.json({message: 'Successfully logged in'}).redirect('http://localhost:5173/newnav');
    } else {
      return res.status(400).json({status: 'error', msg: 'google auth failed (2)'});
    }
  } catch (err) {
    console.log(err);
    return res.status(400).json({status: 'error', msg: 'google auth failed (3)'});
  }
};
module.exports = {postGoogleAuthURL, getGoogleUserData};
