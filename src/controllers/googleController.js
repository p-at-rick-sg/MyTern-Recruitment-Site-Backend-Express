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
      const claims = {
        email: data.email,
        type: auth.rows[0].name, //how do we get this from here
        role: 'standard', //TODO: add role here for the corp/recr type only as user always = user/standard
        id: auth.rows[0].user_id,
      };
      const tokens = await setupJwt(claims);

      // do the databse stuff to store the tokens in the jwt_tokens table (I will only be storing access - refresh will be voided)
      //logic - set timeout to 30 minutes - each time a protected endpoint is called before the expiry, new access is generated - clever huh!!?? Otherwise the session times out

      //database code goes here.
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
