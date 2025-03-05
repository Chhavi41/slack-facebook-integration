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



