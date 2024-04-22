const jwt = require('jsonwebtoken');
//To extract cookies from the cookie headers

const authTalent = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  console.log('Cookie Access Token is: ', accessToken);
  if (!accessToken) {
    return res.status(400).json({
      status: 'error',
      msg: 'No token found (1)',
    });
  }
  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.ACCESS_SECRET); //decode the token
      req.decoded = decoded; //update the req object with the decoded value
      next(); //pass the control to the next item
    } catch (err) {
      return res.status(403).json({status: 'error', msg: 'No token found (2)'});
    }
  }
};

const authContributor = (req, res, next) => {
  if (!('authorization' in req.headers)) {
    return res.status(400).json({status: 'error', msg: 'No token found (3)'});
  }

  const token = req.headers['authorization'].replace('Bearer ', '');

  if (token) {
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

const authAdmin = (req, res, next) => {
  if (!('authorization' in req.headers)) {
    return res.status(400).json({status: 'error', msg: 'No token found (5)'});
  }

  const token = req.headers['authorization'].replace('Bearer ', '');

  if (token) {
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

module.exports = {authTalent, authContributor, authAdmin};
