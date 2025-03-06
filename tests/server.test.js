require('dotenv').config();
const request = require('supertest');
const express = require('express');
const { createClient } = require('redis');
const axios = require('axios');
const amqp = require('amqplib');
const { app, server } = require('../server'); 

jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(),
    on: jest.fn()
  })
}));

jest.mock('axios');
jest.mock('amqplib');

describe('Slack-Facebook Integration API', () => {
  let redisClient;

  beforeAll(async () => {
    redisClient = createClient();
    await redisClient.connect();
  });

  afterAll(async () => {
    jest.restoreAllMocks();
  });

  test('GET / should return welcome message', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toBe('Welcome to the Slack-Facebook Integration API!');
  });

  test('GET /webhook should verify webhook', async () => {
    const res = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': process.env.FB_VERIFY_TOKEN,
      'hub.challenge': 'test_challenge'
    });
    expect(res.status).toBe(200);
    expect(res.text).toBe('test_challenge');
  });

  test('GET /webhook should return 403 for invalid token', async () => {
    const res = await request(app).get('/webhook').query({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'wrong_token'
    });
    expect(res.status).toBe(403);
  });

  test('POST /webhook should process messages', async () => {
    axios.get.mockResolvedValue({ data: { name: 'John Doe' } });
    amqp.connect.mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn().mockResolvedValue(),
        sendToQueue: jest.fn()
      })
    });

    const res = await request(g).post('/webhook').set('Content-Type', 'application/json').send({
      object: 'page',
      entry: [{
        messaging: [{
          sender: { id: '12345' },
          message: { text: 'Hello' }
        }]
      }]
    });
    console.log('76: ', res.status, ':', res.text);
    expect(res.status).toBe(200);
    expect(res.text).toBe('EVENT_RECEIVED');
  });

  test('getUserDetails should return user name from cache', async () => {
    redisClient.get.mockResolvedValue('Cached User');
    const userDetails = await require('../server').getUserDetails('12345');
    expect(userDetails).toBe('Cached User');
  });

  test('getUserDetails should fetch and cache user name', async () => {
    redisClient.get.mockResolvedValue(null);
    axios.get.mockResolvedValue({ data: { name: 'John Doe' } });
    const userDetails = await require('../server').getUserDetails('12345');
    expect(userDetails).toBe('John Doe');
  });

  test('publishToQueue should publish message to RabbitMQ', async () => {
    const channel = {
      assertQueue: jest.fn().mockResolvedValue(),
      sendToQueue: jest.fn()
    };
    amqp.connect.mockResolvedValue({ createChannel: jest.fn().mockResolvedValue(channel) });

    await require('../server').publishToQueue({ senderId: '12345', senderName: 'John Doe', messageText: 'Hello' });
    expect(channel.sendToQueue).toHaveBeenCalled();
  });
});
