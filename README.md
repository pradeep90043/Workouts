# Workouts Application

A full-stack application for tracking and managing workouts with a React Native client and Express.js server.

## 🚀 Features

- Track workout sessions with multiple exercises
- View workout history and statistics
- Categorize exercises by muscle groups
- Set-based exercise tracking with reps, weight, and rest time
- Responsive design for mobile devices

## 🏗️ Project Structure

```
workouts/
├── client/                  # React Native client application
│   ├── src/
│   │   ├── app/            # Main app components and navigation
│   │   └── components/      # Reusable UI components
│   └── package.json         # Client dependencies
├── server/                  # Express.js server
│   ├── models/             # MongoDB models
│   ├── routes/             # API route handlers
│   ├── .env                # Environment variables
│   ├── index.js            # Main server file
│   └── package.json        # Server dependencies
└── README.md               # This file
```

## 🛠️ Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- React Native development environment (for client)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Workouts
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   cp .env.example .env  # Update with your MongoDB URI
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Variables**
   Create a `.env` file in the server directory with:
   ```
   PORT=3003
   MONGODB_URI=mongodb://localhost:27017/workouts
   NODE_ENV=development
   ```

## ⚙️ Running the Application

1. **Start MongoDB**
   Make sure MongoDB is running locally or update the connection string in `.env`

2. **Start the server**
   ```bash
   cd server
   npm start
   ```
   Server will be available at `http://localhost:3003`

3. **Start the client**
   ```bash
   cd client
   npm start
   ```
   Follow the Expo instructions to run on your device or emulator.

## 📚 API Documentation

### Base URL
`http://localhost:3003/api`

### Endpoints

#### Health Check
- **GET** `/health`
  - Check if the server is running
  - Response: `{ status: 'ok', db: 'connected' }`

#### Workouts
- **GET** `/workouts/summary`
  - Get summary of all workouts
  - Query Params:
    - `startDate`: Filter workouts from this date (ISO format)
    - `endDate`: Filter workouts until this date (ISO format)

- **POST** `/workouts`
  - Add a new workout
  - Request Body:
    ```json
    {
      "exercises": [{
        "name": "Exercise Name",
        "muscleGroup": "muscle-group",
        "sets": [
          {"reps": 12, "weight": 10, "rest": 60},
          {"reps": 10, "weight": 12.5, "rest": 60}
        ],
        "notes": "Optional notes",
        "rating": 3,
        "duration": 120
      }]
    }
    ```

## 🧪 Testing

### Server Tests
```bash
cd server
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ by [Your Name]
- Special thanks to all contributors

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
