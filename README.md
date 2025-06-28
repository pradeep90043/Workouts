# Workouts Application

A full-stack application for managing workouts with separate client and server.

## Project Structure

```
workouts/
├── client/           # React Native client application
│   ├── src/         # Source code
│   └── package.json # Client dependencies
├── server/          # Express.js server
│   ├── server.js    # Main server file
│   ├── .env         # Environment variables
│   └── package.json # Server dependencies
└── package.json     # Root package.json for running both
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start both client and server:
```bash
npm start
```

This will:
- Start the Expo client application
- Start the Express server on port 3001

You can also run them individually:
- Client only: `npm run client`
- Server only: `npm run server`

## Development

The client is a React Native application using Expo.
The server is an Express.js application running on port 3001.

## Environment Variables

Create a `.env` file in the server directory with:
```
PORT=3001
```
