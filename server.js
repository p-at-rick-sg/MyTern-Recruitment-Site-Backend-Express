const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

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
const privatekey = fs.readFileSync('key.pem', 'utf8');
const certificate = fs.readFileSync('cert.pem', 'utf8');
const credentials = {key: privatekey, cert: certificate};

app.use(
  cors({
    origin: 'http://localhost:5173',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  })
); //this opens to all domains
app.use(helmet());
app.use(limiter);
//Setup app to be able to consume paramters from URLs
app.use(express.json());
app.use(express.urlencoded({extended: false}));
const httpsServer = https.createServer(credentials, app);
//use the db connection to check connection before starting the listener
const db = new PostgresConnection(); // Create a single instance (singleton)

(async () => {
  try {
    const client = await db.pool.connect(); // Use the connection pool
    console.log('Postgres DB Connected Successfully!');
    httpsServer.listen(PORT, () => {
      console.log('Listening on Port TCP: 7001');
    });
  } catch (err) {
    console.error('Postgres DB Connection Failed: ', err);
    process.exit(1);
  } finally {
    // Close the connection pool when the application exits
    // await db.pool.end();
  }
})();

//Add the main routers and links to sub-routers here
// app.use('/auth');
app.use('/auth', authRouter);
app.use('/api', apiRouter);
app.use('/api', talentRouter);
app.use('/api', recruiterRouter);
app.use('/api', (req, res) => res.status(404).json('No route for this path'));

module.exports = {db};
