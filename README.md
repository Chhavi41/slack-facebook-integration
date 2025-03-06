# Slack-Facebook Integration

This project is a **Node.js-based integration** that automatically forwards new messages from a **Facebook Page Inbox** to a designated Slack 
channel (`facebook-updates`).

## Features
- **Real-time Facebook Message Listener**: Listens for new messages on a Facebook Page.
- **Slack Notification System**: Sends message updates to Slack using webhooks.
- **Scalable Architecture**: Designed using Express.js for flexibility and easy deployment.

## Tech Stack
- **Backend**: Node.js with Express.js
- **Messaging APIs**: Facebook Graph API, Slack API
- **Testing**: Jest, Supertest
- **Logging**: Winston

## 1. **Prerequisites
Before using this API, ensure you have:

- A Slack Workspace
- A Facebook Page
- A Facebook Developer Account (Sign Up)
- Node.js and npm/yarn installed on your system
- Redis (for caching)
- RabbitMQ (for message queuing)
- ngrok (to expose localhost)

## 2. **Setup Instructions 
- Clone the repository**:
   ```sh
   git clone https://github.com/Chhavi41/slack-facebook-integration.git  
   cd slack-facebook-integration
   ```
- Install Dependencies
```sh
 npm install
```

## 3. Set Up Environment Variables
   Create a .env file in the root folder and add the following:
```sh
FACEBOOK_PAGE_ACCESS_TOKEN=fb_page_access_token
FB_VERIFY_TOKEN=verify_token
SLACK_WEBHOOK_URL=url
NGROK_ACCESS_TOKEN=ngrok_access_token
```
Now do the following to obtain required values:

## 4. Obtaining required credentials
### Get SLACK_WEBHOOK_URL
1. Go to https://api.slack.com/apps . Click "Create New App"
2. Name your app and select your slack workspace.
3. Under features, enable Incoming webhooks.
4. Click "Add new webhook to workspace"
5. Choose a channel where messages will be posted.
6. Copy webhook URL, add it to your .env file under SLACK_WEBHOOK_URL

### Get FACEBOOK_PAGE_ACCESS_TOKEN
1. Go to Facebook Developer Portal
2. Create a new app, => "My Apps" -> "Create App"
3. In app dashboard, go to "Add a product"
4. Select "Messenger" and click "Set Up"
5. Expose Localhost Using ngrok
   - By default, your localhost server is not accessible over the internet. To allow Facebook Webhooks to send messages to your local API, you need to make your localhost URL publicly accessible using ngrok.
   - install ngrok
   - Run your Express server
   - Expose Localhost Using ngrok: Run the following command to expose your local port 8000:
     ```sh
         ngrok http 8000
     ```
   - You will see an output like this:
     ``` sh
       Session Status                online
       Version                       2.3.35
       Region                        United States (us)
       Web Interface                 http://127.0.0.1:4040
       Forwarding                    https://random-subdomain.ngrok.io -> http://localhost:8000
     ```

6. The FACEBOOK_VERIFY_TOKEN is a secret token that you create yourself. Generate a Random Verify Token:
   ```sh
      openssl rand -hex 16
    ```
   This will generate a random 32-character hexadecimal string, such as:
   ```sh
   a1b2c3d4e5f67890123456789abcdef0
   ```
   Add the Token to .env File
   ```sh
   FACEBOOK_VERIFY_TOKEN=a1b2c3d4e5f67890123456789abcdef0
   ```

7. Add Webhook in Facebook Developer Portal
   - Go to Webhooks section: In your Facebook Developer App, go to Messenger → Webhooks.
   - Add webhook URL (https://random-subdomain.ngrok.io/webhook) and verify token generated in step 
   - Click verify and save
     
8. Subscribe to Events:
   - Enable following events:
      - messages
      - messaging_postbacks
Now, Facebook Webhooks will send real-time messages to your localhost server through ngrok! 🚀

9. Generate Page Access Token:
 - Under Messenger Settings, scroll to "Access Tokens."
 - Select your Facebook Page and Generate Token.
 - Copy the token and add it to your .env file as FACEBOOK_PAGE_ACCESS_TOKEN.




