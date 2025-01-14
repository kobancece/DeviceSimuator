require('dotenv').config();

const app = require('./app');
const mqtt = require('mqtt');
const db = require('./models/db');

const PORT = process.env.PORT || 3000;
const MQTT_BROKER_URL = 'mqtt://test.mosquitto.org';

const mqttClient = mqtt.connect(MQTT_BROKER_URL);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  mqttClient.subscribe('simulator/program', (err) => {
    if (err) {
      console.error('Failed to subscribe to topic', err);
    } else {
      console.log('Subscribed to simulator/program topic');
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  console.log(`Message received on topic ${topic}: ${message.toString()}`);
  
  if (topic === 'simulator/program') {
    try {
      const data = JSON.parse(message.toString());
      console.log('Parsed data:', data);
      
      const { userId, programId, temperature, spinSpeed, electricConsumption, waterConsumption, duration } = data;

      if (!userId || !programId || temperature === undefined || spinSpeed === undefined || electricConsumption === undefined || waterConsumption === undefined || duration === undefined) {
        console.error('Missing fields in the message');
        return;
      }

      // Log the userId before inserting
      console.log(`Inserting wash session with userId: ${userId}, programId: ${programId}`);

      // Insert the new wash session into the washsessions table
      const durationInHours = duration / 60;
      const totalElectricConsumption = electricConsumption * durationInHours;
      const totalCost = totalElectricConsumption * 0.82; // Assuming the cost rate is $0.82 per kWh

      const [insertResult] = await db.execute(
        'INSERT INTO washsessions (userId, programId, washTimestamp, electricConsumption, waterConsumption, totalCost, duration) VALUES (?, ?, NOW(), ?, ?, ?, ?)', 
        [userId, programId, totalElectricConsumption, waterConsumption, totalCost, duration]
      );

      console.log('Wash session added successfully', insertResult.insertId);
    } catch (error) {
      console.error('Error processing MQTT message', error);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
