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
  const userId = req.decoded.id;
  const client = await db.pool.connect();
  try {
    const userQueryString = `SELECT summary, active FROM users WHERE id = $1`;
    const userParams = [userId];
    const userResult = await client.query(userQueryString, userParams);
    console.log(userResult);
    return res.status(200).json(userResult.rows[0]);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  }
};

const getSkills = async (req, res) => {
  const userId = req.decoded.id;
  const client = await db.pool.connect();
  let skillsResult;
  try {
    const skillsQueryString = `SELECT skills.skill_id, skills.skill_name, user_skills_link.level, user_skills_link.experience FROM skills
      INNER JOIN user_skills_link ON skills.skill_id = user_skills_link.skill_id
      WHERE user_skills_link.user_id = $1;`;
    const skillsParams = [userId];
    skillsResult = await client.query(skillsQueryString, skillsParams);
  } catch (err) {
    return res.status(400).json({status: 'error', msg: 'failed to retrieve data'});
  }
  //clean the data and return
  const cleansedResult = skillsResult.rows;
  console.log('skills return: ', cleansedResult);
  return res.status(200).json(cleansedResult);
};

const updateSkills = async (req, res) => {
  const userId = req.decoded.id;
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
  const userId = req.decoded.id;
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

const updateBasic = async (req, res) => {
  //basic is summary and active both in the main user object in db
  const userId = req.decoded.id;
  if ('summary' in req.body) {
    const summary = req.body.summary;
    const client = await db.pool.connect();
    try {
      client.query('BEGIN;');
      summaryQueryStr = `UPDATE users
      SET summary = $1
      WHERE id = $2;`;
      summaryParams = [summary, userId];
      await client.query(summaryQueryStr, summaryParams);
      client.query('COMMIT;');
      return res.status(200).json({statud: 'ok', msg: 'updated professional summary'});
    } catch (err) {
      return res.status(400).json({status: 'error', msg: 'failed to update basic info'});
    } finally {
      client.release();
    }
  }
  if ('active' in req.body) {
    const active = req.body.active;
    const client = await db.pool.connect();
    try {
      client.query('BEGIN;');
      summaryQueryStr = `UPDATE users
      SET active = $1
      WHERE id = $2;`;
      summaryParams = [active, userId];
      await client.query(summaryQueryStr, summaryParams);
      client.query('COMMIT;');
      return res.status(200).json({statud: 'ok', msg: 'updated active status'});
    } catch (err) {
      return res.status(400).json({status: 'error', msg: 'failed to update active status'});
    } finally {
      client.release();
    }
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
  getSkills,
  updateBasic,
};
