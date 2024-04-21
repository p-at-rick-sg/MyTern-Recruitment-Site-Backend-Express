const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {v4: uuidv4} = require('uuid');

const signup = async (req, res) => {
  try {
    const auth = await UserModel.findOne({email: req.body.email});
    if (auth) {
      return res.status(400).json({
        status: 'error',
        msg: 'duplicate username/user already registered',
      });
    }
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    // create the object to pass to the database
    const newUser = {
      email: req.body.email,
      passwordHash,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      address1: req.body.address1,
      town: req.body.town,
      country: req.body.country,
      postcode: req.body.postcode,
    };
    //add optional elements to the object
    if ('address2' in req.body) newUser.address2 = req.body.address2;
    if ('telephone' in req.body) newUser.telephone = req.body.telephone;
    if ('role' in req.body) newUser.role = req.body.role;
    if ('active' in req.body) newUser.active = req.body.active;
    await UserModel.create(newUser);

    res.status(200).json({status: 'ok', msg: 'user registered successfully'});
  } catch (err) {
    console.log(err.message);
    res.status(400).json({status: 'error', msg: 'failed registration'});
  }
};

const signin = async (req, res) => {
  try {
    const auth = await UserModel.findOne({email: req.body.email});
    if (!auth) {
      return res.status(400).json({status: 'error', msg: 'not authorized'}); //this is the invalid username return
    }
    const result = await bcrypt.compare(req.body.password, auth.passwordHash); //compare the password hash against stored hash

    if (!result) {
      console.log('incorrect username');
      return res.status(400).json({status: 'not ok', msg: 'failed login'});
    }
    //if we get here login succeeded so we set up the jwt
    const claims = {
      username: auth.email,
      role: auth.role,
      id: auth.id,
    };
    const access = jwt.sign(claims, process.env.ACCESS_SECRET, {
      expiresIn: '10d',
      jwtid: uuidv4(),
    });

    const refresh = jwt.sign(claims, process.env.REFRESH_SECRET, {
      expiresIn: '30d',
      jwtid: uuidv4(),
    });

    res.json({access, refresh});
  } catch (err) {
    console.error('failed login after password check');
    return res.status(400).json({error: err, msg: 'Other failed login error'});
  }
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

module.exports = {signup, signin, refresh};
