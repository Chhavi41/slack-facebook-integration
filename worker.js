require('dotenv').config();
const amqp = require('amqplib');
const axios = require('axios');
const logger = require('./logger');
const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
const QUEUE_NAME = "fb_messages";
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

// Function to Process Incoming Messages
async function consumeMessages() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log("🚀 Waiting for messages in queue...");

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const messageData = JSON.parse(msg.content.toString());

                console.log("📩 Processing:", messageData);

                if (messageData.type === "text") {
                    await sendToSlack(messageData.senderId, messageData.senderName, messageData.messageText);
                } else if (messageData.type === "media") {
                    await sendMediaToSlack(messageData.senderId, messageData.senderName, messageData.mediaUrl);
                }
                // Acknowledge message after processing
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error("RabbitMQ Consumer Error:", error.message);
    }
}

// Send Message to Slack
async function sendToSlack(senderId, senderName, messageText ) {
    if (!SLACK_WEBHOOK_URL) {
        console.error("SLACK_WEBHOOK_URL is not defined.");
        return;
    }

    const payload = {
        text: `📩 *New Facebook Message*\n\n👤 *From:* ${senderName} (ID: \`${senderId}\`)\n💬 *Message:* "${messageText}"`
    };

    try {
        await axios.post(SLACK_WEBHOOK_URL, payload);
        console.log("Message sent to Slack");
    } catch (error) {
        console.error("Error sending to Slack:", error.response ? error.response.data : error.message);
    }
}

async function sendMediaToSlack(senderId, senderName, mediaUrl) {
    try {
      const payload = {
        text: `*New Media Message from ${senderName}* (ID: \`${senderId}\`)\n`,
        attachments: [{ image_url: mediaUrl, fallback: "Media attachment" }],
      };
  
      await axios.post(SLACK_WEBHOOK_URL, payload);
      logger.info("Media message sent to Slack successfully!");
    } catch (error) {
      logger.error("Error sending media message to Slack:", error.response?.data || error.message);
    }
  }

//  Start Consumer
consumeMessages();
