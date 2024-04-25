const jwt = require('jsonwebtoken');
//To extract cookies from the cookie headers

const authAny = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  // console.log('Cookie Access Token is: ', accessToken);
  // Object.keys(req.cookies).forEach(cookieName => {
  //   console.log(`${cookieName}: ${req.cookies[cookieName]}`);
  // });
  if (!accessToken) {
    return res.status(401).json({
      status: 'error',
      msg: 'No token found in cookie',
    });
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
    // console.log('Decoded Token: ', decoded);
    var d = new Date();
    var seconds = Math.round(d.getTime() / 1000);
    const remainingMs = decoded.exp - seconds;
    console.log('Remaining MS', remainingMs);
    if (remainingMs >= 100000) {
      console.log('valid token timing');
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

const authTalent = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log('Cookie Access Token is: ', accessToken);
  console.log('Cookies:');
  Object.keys(req.cookies).forEach(cookieName => {
    console.log(`${cookieName}: ${req.cookies[cookieName]}`);
  });
  if (!accessToken) {
    return res.status(401).json({
      status: 'error',
      msg: 'No token found in cookie',
    });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET);
    console.log('Decoded Token: ', decoded);

    if (decoded.type === 'user') {
      req.decoded = decoded;
      next();
    } else {
      throw new Error('Invalid token type');
    }
  } catch (err) {
    console.error('Error decoding token:', err.message);
    return res.status(403).json({
      status: 'error',
      msg: 'Invalid or expired token',
    });
  }
};

const authCorpUser = (req, res, next) => {
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
      if (decoded.role === 'contributor') {
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
