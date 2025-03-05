require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const amqp = require('amqplib');
const redis = require('redis');
const logger = require('./logger');
const VERIFY_TOKEN = process.env.FB_VERIFY_TOKEN;
const facebook_page_access_token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "fb_messages";

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Connect to Redis
const redisClient = redis.createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
    console.error('Redis Error:', err);
});

redisClient.connect().then(() => console.log("✅ Connected to Redis"));

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8000;


// Facebook Webhook Verification (GET)
app.get('/webhook', async (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully!');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/webhook', async (req, res) => {
  if (req.body.object === 'page') {
    logger.info('Webhook event received');

    req.body.entry.forEach(async (entry) => {
      try {
        const webhookEvent = entry.messaging[0];

        if (webhookEvent.message) {
          const senderId = webhookEvent.sender.id;
          const messageText = webhookEvent.message.text;
          const senderName = await getUserDetails(senderId);

          logger.info(`Message received`, { sender: senderName, text: messageText });

          await publishToQueue({ senderId, senderName, messageText });
        }
      } catch (error) {
        logger.error("Error processing webhook event", { error: error.message });
      }
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    logger.warn("Unknown webhook event received", { body: req.body });
    res.sendStatus(404);
  }
});

async function getUserDetails(senderId) {
    const cacheKey = `fb_user:${senderId}`;
    const url = `https://graph.facebook.com/${senderId}?fields=name&access_token=${facebook_page_access_token}`;
    try {
        const cachedName = await redisClient.get(cacheKey);
        if (cachedName) {
            console.log(`Retrieved from cache: ${cachedName}`);
            return cachedName;
        }
        const response = await axios.get(url);
        await redisClient.set(cacheKey, response.data.name, { EX: 86400 });
        logger.info('Cached user name:', response.data.name);
        return response.data.name; // Extracting full name
    } catch (error) {
        logger.error("❌ Error fetching user name:", error.response ? error.response.data : error.message);
        return `User (${senderId})`; // Fallback to sender ID if fetching name fails
    }
}

async function publishToQueue(message) {
  try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });

      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(message)), { persistent: true });
      logger.info("Message added to queue:", message);

      setTimeout(() => {
          connection.close();
      }, 500);
  } catch (error) {
      logger.error("Error publishing to RabbitMQ:", error.message);
  }
}


const server = app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Slack-Facebook Integration API!');
  });


module.exports = { app, server, getUserDetails, publishToQueue };
  
