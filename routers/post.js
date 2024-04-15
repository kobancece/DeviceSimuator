const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.post('/simulator/program', async (req, res) => {
  const { programName, temperature, speedLevel } = req.body;
  
  if (!programName || temperature === undefined || speedLevel === undefined) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    const [result] = await db.execute('INSERT INTO wmPrograms (programName, temperature, speedLevel) VALUES (?, ?, ?)', ["Eco60", 60, 1400]);
    res.status(201).send({ message: 'Program added successfully', programId: result.insertId });
  } catch (error) {
    res.status(500).send({ message: 'Error adding program', error: error.message });
  }
});

router.get('/simulator/program', async (req, res) => {
  try {
    const [programs, _] = await db.query('SELECT * FROM wmPrograms');
    res.status(200).json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving programs', error: error.message });
  }
});

router.get('/simulator/program/:programId', async (req, res) => {
  const wmProgramId = req.params.programId;

  try {
    const [programs, _] = await db.query('SELECT * FROM wmPrograms WHERE wmProgramId = ?', [wmProgramId]);
    
    if (programs.length > 0) {
      res.status(200).json(programs[0]);
    } else {
      res.status(404).send({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving the program', error: error.message });
  }
});

router.delete('/simulator/program/:programId', async (req, res) => {
  const wmProgramId = req.params.programId;

  try {
    const [result] = await db.execute('DELETE FROM wmPrograms WHERE wmProgramId = ?', [wmProgramId]);
    
    if (result.affectedRows > 0) {
      res.status(200).send({ message: 'Program deleted successfully' });
    } else {
      res.status(404).send({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting the program', error: error.message });
  }
});

router.post('/simulator/program/update/:programId', async (req, res) => {
  const { programName, temperature, speedLevel } = req.body;
  const wmProgramId = req.params.programId;

  // Basic validation to ensure required fields are provided
  if (!programName || temperature === undefined || speedLevel === undefined) {
    return res.status(400).send({ message: 'Missing fields. Please provide programName, temperature, and speedLevel.' });
  }

  try {
    const [result] = await db.execute('UPDATE wmPrograms SET programName = ?, temperature = ?, speedLevel = ? WHERE wmProgramId = ?', [programName, temperature, speedLevel, wmProgramId]);
    
    if (result.affectedRows > 0) {
      res.status(200).send({ message: 'Program updated successfully' });
    } else {
      res.status(404).send({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating the program', error: error.message });
  }
});

module.exports = router;
