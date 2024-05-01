const {PostgresConnection} = require('../models/db');
const db = new PostgresConnection();

//Document AI Setup
// const {DocumentProcessorServiceClient} = require('google-cloud/documentai');
const projectID = 'ga-project-4-420504';
const bcrypt = require('bcrypt');
const {addDays, subDays, format} = require('date-fns');

const simpleGet = (req, res) => {
  console.log('sending the test protected reponse');
  return res.status(200).json({msg: 'test response'});
};

const getUserBasic = async (req, res) => {
  //TODO upate to use the userId from the authenticated request
  const client = await db.pool.connect();
  try {
    const userId = req.params.userId;
    const userQueryString = `SELECT summary, active FROM users WHERE id = $1`;
    const userParams = [userId];
    const userResult = await client.query(userQueryString, userParams);
    console.log(userResult);
    return res.status(200).json(userResult.rows[0]);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  }
};

const updateSkills = async (req, res) => {
  console.log(req.body.length);
  const userId = '7adf8371-9148-48c6-b7ad-090016faba21'; //upadte after testing
  const client = await db.pool.connect();
  if (req.body.length !== 0) {
    try {
      const skillQueryString = `UPDATE user_skills_link
      SET level = $1, experience = $2
      WHERE user_id = $3 AND skill_id = $4;`;
      for (const skill of req.body) {
        console.log(skill.level, skill.experience, skill.skillId);
        const skillParams = [skill.level, skill.experience, userId, skill.skillId];
        client.query(skillQueryString, skillParams);
      }
      client.query('COMMIT;');
      console.log('updated all user skills');
      return res.status(200).json({status: 'ok', msg: 'all skills updated'});
    } catch (err) {
      console.error('failed to delete skill from user', err);
      client.query('ROLLBACK;');
      return res.status(400).json({status: 'error', msg: 'failed to delete users skill'});
    }
  }
};

const deleteSkills = async (req, res) => {
  console.log(req.body);
  const userId = '7adf8371-9148-48c6-b7ad-090016faba21'; //upadte after testing
  const client = await db.pool.connect();
  try {
    client.query('BEGIN;');
    const deleteQueryString = `DELETE FROM user_skills_link
    WHERE user_id = $1 AND skill_id = $2;`;

    for (const skillLink of req.body) {
      const deleteParams = [userId, skillLink.skillId];
      client.query(deleteQueryString, deleteParams);
    }
    console.log('all skill links deleted');
    client.query('COMMIT;');
    return res.status(200).json({status: 'ok', msg: 'skills removed from user'});
  } catch (err) {
    console.error('failed to delete skill from user');
    client.query('ROLLBACK;');
    return res.status(400).json({status: 'error', msg: 'failed to delete users skill'});
  } finally {
    console.info('releasing client');
    client.release();
  }
};

const getWorkHistory = async (req, res) => {
  return res.status(400);
};

module.exports = {
  simpleGet,
  getUserBasic,
  updateSkills,
  deleteSkills,
};
