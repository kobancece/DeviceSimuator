const express = require('express');
const router = express.Router();
const db = require('../models/db');
const bcrypt = require('bcrypt');
const saltRounds = 10; // for bcrypt

router.post('/simulator/program', async (req, res) => {
  const { programName, temperature, spinSpeed, electricConsumption, waterConsumption, duration } = req.body;
  
  // Check for missing fields
  if (!programName || temperature === undefined || spinSpeed === undefined || electricConsumption === undefined || waterConsumption === undefined || duration === undefined) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    // Execute the INSERT INTO statement with the correct table name and column names
    const [result] = await db.execute('INSERT INTO wmprograms (programName, temperature, spinSpeed, electricConsumption, waterConsumption, duration) VALUES (?, ?, ?, ?, ?, ?)', 
    [programName, temperature.toString(), spinSpeed.toString(), electricConsumption, waterConsumption, duration]);

    // Send back a success response
    res.status(201).send({ message: 'Program added successfully', programId: result.insertId });
  } catch (error) {
    // Handle any errors
    res.status(500).send({ message: 'Error adding program', error: error.message });
  }
});


router.get('/simulator/program', async (req, res) => {
  try {
    const [programs, _] = await db.query('SELECT * FROM wmPrograms');
    console.log("Fetched programs:", programs);
    res.status(200).json(programs);
  } catch (error) {
    console.error('Error retrieving programs:', error);
    res.status(500).json({ message: 'Error retrieving programs', error: error.message });
  }
});

router.get('/simulator/program/:programId', async (req, res) => {
  const wmProgramId = req.params.programId;

  try {
    const [programs, _] = await db.query('SELECT * FROM wmPrograms WHERE programId = ?', [wmProgramId]);
    
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
    const [result] = await db.execute('DELETE FROM wmPrograms WHERE programId = ?', [wmProgramId]);
    
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
  const { programName, temperature, spinSpeed, electricConsumption, waterConsumption, duration } = req.body;
  const programId = req.params.programId;

  // Basic validation to ensure required fields are provided
  if (!programName || temperature === undefined || spinSpeed === undefined || electricConsumption === undefined || waterConsumption === undefined || duration === undefined) {
    return res.status(400).send({ message: 'Missing fields' });
  }

  try {
    const [result] = await db.execute('UPDATE wmPrograms SET programName = ?, temperature = ?, spinSpeed = ?, electricConsumption = ?, waterConsumption = ?, duration = ? WHERE programId = ?', [programName, temperature, spinSpeed, electricConsumption, waterConsumption, duration, programId]);
    
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