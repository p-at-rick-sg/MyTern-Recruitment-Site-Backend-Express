const jwt = require('jsonwebtoken');
const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();
//To extract cookies from the cookie headers

const checktokenDb = async userId => {
  const client = await db.pool.connect();
  try {
    const sessionResult = await client.query(`SELECT id FROM sessions WHERE user_id = $1;`, [
      userId,
    ]);
    console.log('session result: ', sessionResult);
    if (sessionResult.rows.length === 0) {
      return false;
    } else {
      const sessionId = sessionResult.rows[0].id;
      const tokenResult = await client.query(
        `SELECT jti FROM access_tokens WHERE session_id = $1`,
        [sessionId]
      );
      if (tokenResult.rows[0].jti !== null) {
        return true;
      } else return false;
    }
  } catch (err) {
    console.error('failed to check the users token in the db: ', err);
    return false;
  }
};

const authAny = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log('authany middleware running: acctok: ', accessToken);
  if (!accessToken) {
    return res.status(401).json({
      status: 'error',
      msg: 'No token found in cookie',
    });
  }
  try {
    const client = await db.pool.connect();
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
    // first check the access-tokens db
    const userId = decoded.id;
    const validToken = checktokenDb(userId);
    if (!validToken) {
      //reject the request
      throw new Error('Token not in databse - session was deleted');
    }
    var d = new Date();
    var seconds = Math.round(d.getTime() / 1000);
    const remainingSeconds = decoded.exp - seconds;
    console.log('Remaining Seconds', remainingSeconds);
    if (remainingSeconds >= 120) {
      console.log('valid token & expiry');
      req.decoded = decoded;
      next();
    } else {
      throw new Error('Token Expiry within 1 minute');
    }
  } catch (err) {
    console.error('Error decoding token:', err.message);
    return res.status(403).json({
      status: 'error',
      msg: 'Invalid or expired token',
    });
  }
};

const authTalent = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log('Cookie Access Token is: ', accessToken);
  if (!accessToken) {
    return res.status(401).json({
      status: 'error',
      msg: 'No token found in cookie',
    });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
    console.log('Decoded Token: ', decoded);
    const userId = decoded.id;
    const validToken = await checktokenDb(userId);
    console.log('token db result:', validToken);
    if (!validToken) {
      //reject the request
      console.info('token not in db');
      return res.status(401).json({status: 'error', msg: 'token not in db'});
    }
    if (decoded.type === 'user') {
      //now check the session database in case it's blacklisted

      req.decoded = decoded;
      next();
    } else {
      throw new Error('Invalid token type');
    }
  } catch (err) {
    console.error('Error with token:', err);
    return res.status(403).json({
      status: 'error',
      msg: 'Invalid or expired or blacklisted token',
    });
  }
};

const authCorpUser = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      status: 'error',
      msg: 'No token found (3)',
    });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      const userId = decoded.id;
      const validToken = await checktokenDb(userId);
      console.log('token db result:', validToken);
      if (!validToken) {
        //reject the request
        console.info('token not in db');
        return res.status(401).json({status: 'error', msg: 'token not in db'});
      }
      if (decoded.type === 'corp') {
        //add role later when I have setup for now use only this auth
        req.decoded = decoded;
        next();
      } else throw new Error();
    } catch (err) {
      console.error('err.message');
      return res.status(401).json({status: 'error', msg: 'No token found (4)'});
    }
  }
};

const authCorpAdmin = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      status: 'error',
      msg: 'No token found (3)',
    });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (decoded.role === '') {
        req.decoded = decoded;
        next();
      } else throw new Error();
    } catch (err) {
      console.error('err.message');
      return res.status(401).json({status: 'error', msg: 'No token found (4)'});
    }
  }
};

const authSiteAdmin = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    return res.status(400).json({
      status: 'error',
      msg: 'No token found (3)',
    });
  }

  if (accessToken) {
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
      if (decoded.role === 'admin') {
        req.decoded = decoded;
        next();
      } else throw new Error();
    } catch (err) {
      console.error('err.message');
      return res.status(401).json({status: 'error', msg: 'No token found (6)'});
    }
  }
};

module.exports = {authTalent, authCorpAdmin, authCorpUser, authSiteAdmin, authAny};
