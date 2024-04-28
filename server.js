const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');
//Middleware
const {authTalent, authAny} = require('./src/middleware/authMiddleware');

//Security Stuff
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const PORT = process.env.PORT || 7001;

const {PostgresConnection} = require('./src/models/db');

//Add additional sub-router files here
const authRouter = require('./src/routers/authRouter');
const recruiterRouter = require('./src/routers/recruiterRouter');
const talentRouter = require('./src/routers/talentRouter');
const apiRouter = require('./src/routers/apiRouter');

//Set rate limiter up
const limiter = rateLimit({
  windowsMs: 15 * 60 * 1000, //period in ms - 15 mins
  max: 100, //each ip limited to 100 req per window above
  standardHeaders: true, //sends back this header
  legacyHeaders: false, //disables x-regulate
});
//Initialise main app
const app = express();
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5731'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
);
app.use(helmet());
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//use the db connection to check connection before starting the listener
const db = new PostgresConnection(); // Create an instance (singleton to control connections)

(async () => {
  try {
    const client = await db.pool.connect(); // Use the connection pool
    console.log('Postgres DB Connected Successfully!');
    app.listen(PORT, () => {
      console.log('Listening on Port TCP: 7001');
    });
    client.release();
  } catch (err) {
    console.error('Postgres DB Connection Failed: ', err);
    process.exit(1);
  }
})();

//Add the main routers and links to sub-routers here
app.use('/auth', authRouter);
app.use('/api/sec', authAny, apiRouter); //secured api routes for any user type
app.use('/api/talent', talentRouter); //users router - 1 level auth only = REOVED FOR FILE TESTING (authTalent, )
app.use('/api', apiRouter); //general enum lookups etc - no authentication on any
app.use('/api/recruiter', recruiterRouter);
app.use('/api', (req, res) => res.status(404).json('No route for this path'));

module.exports = {db};
