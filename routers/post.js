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

router.post('/simulator/calculate', async (req, res) => {
  // Extract the programId from the request body
  const { programId } = req.body;

  try {
    // Fetch the program details from the wmPrograms table using the programId
    const [programs] = await db.query('SELECT * FROM wmPrograms WHERE programId = ?', [programId]);
    
    if (programs.length === 0) {
      return res.status(404).send({ message: 'Program not found' });
    }
    
    const programData = programs[0];

    // Generate a random userId for the sake of this example
    const userId = Math.floor(Math.random() * 10000) + 1;

    // Calculate the electric consumption and total cost
    const durationInHours = programData.duration / 60;
    const electricConsumption = programData.electricConsumption * durationInHours; // As it's for 60 mins, adjust if needed
    const totalCost = electricConsumption * 0.82; // Assuming the cost rate is $0.82 per kWh

    // Insert the new wash session into the washsessions table
    const [insertResult] = await db.execute(
      'INSERT INTO washsessions (userId, programId, washTimestamp, electricConsumption, waterConsumption, totalCost, duration) VALUES (?, ?, NOW(), ?, ?, ?, ?)', 
      [1, programId, electricConsumption, programData.waterConsumption, totalCost, programData.duration]
    );
    
    // Send back a success response with the sessionId
    res.status(201).send({ message: 'Wash session calculated and added', sessionId: insertResult.insertId });
  } catch (error) {
    // If there's an error, send back an error response
    console.error('Error calculating wash session:', error);
    res.status(500).send({ message: 'Error calculating wash session', error: error.message });
  }
});

module.exports = router;