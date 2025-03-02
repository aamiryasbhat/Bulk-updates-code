# 🚀 Bulk Action Platform

## 📌 Overview
The Bulk Action Platform is a high-performance service designed to efficiently handle bulk updates on entities. It provides APIs for creating, scheduling, and monitoring bulk actions with ease.

## 🌟 Features
- ✅ **Bulk Updates** – Perform multiple updates in a single request.
- ✅ **Scheduled Actions** – Schedule bulk updates for future execution.
- ✅ **Status Tracking** – Get real-time status updates on bulk actions.
- ✅ **Action Statistics** – View success, failure, and skipped record counts.
- ✅ **Scalable Architecture** – Built for large-scale data operations.

## 🏗️ Tech Stack
- **Node.js** – Backend framework
- **Express.js** – API server
- **MongoDB + Mongoose** – NoSQL database
- **PostgreSQL + Sequelize** – SQL database
- **Redis + BullMQ** – Queue management
- **UUID** – Unique identifiers
- **Dotenv** – Environment variable management

---

## 🔧 Installation

### 📌 Prerequisites
Ensure the following are installed:
- [Node.js](https://nodejs.org/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

### ⚡ Setup
1. **Clone the Repository:**
   
   git clone https://github.com/aamiryasbhat/Bulk-updates-code.git
   cd bulk-action-platform
   
2. **Install Dependencies:**
   
   npm install
  
3. **Set Up Environment Variables:**
   Create a `.env` file and configure database connections:
   .env
   MONGO_URI=your_mongodb_connection_string
   POSTGRES_URI=your_postgres_connection_string
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   
4. **Start the Server:**
   
   npm run dev  # Development mode (with nodemon)
  
   or
   
   npm start  # Production mode
  

---

## 🎯 Usage

### 🔹 API Endpoints

#### 📌 1. Create Bulk Action
**Request:**

POST /bulk-actions
{
  "accountId": "12345",
  "entityType": "contacts",
  "updates": [
    { "contactId": "abc123", "updates": { "email": "new@example.com" } }
  ],
  "scheduledAt": "2025-03-10T10:00:00Z"
}


**Response:**
{
  "message": "Bulk action scheduled",
  "actionId": "uuid",
  "status": "SCHEDULED",
  "totalUpdates": 1,
  "scheduledAt": "2025-03-10T10:00:00Z",
  "currentTimeIST": "2025-03-01T12:00:00Z"
}


#### 📌 2. Get Bulk Action Status
**Request:**

GET /bulk-actions/:actionId

**Response:**

{
  "status": "QUEUED"
}


#### 📌 3. Get All Bulk Actions
**Request:**

GET /bulk-actions

**Response:**

[
  {
    "_id": "67c4320645bdd5ac1d7b7364",
    "actionId": "870bd7dd-2f8b-4aea-9de2-eecf5ca31d8b",
    "status": "COMPLETED"
  },
  {
    "_id": "67c4320645bdd5ac1d7b7365",
    "actionId": "9a8bd7dd-3f4c-4aea-8de2-ffc5ca31e3f2",
    "status": "QUEUED"
  }
]


#### 📌 4. Get Bulk Action Stats
**Request:**

GET /bulk-actions/:actionId/stats

**Response:**

{
  "successCount": 10,
  "failureCount": 2,
  "skippedCount": 1
}


---

## 📜 Scripts
- **Start Server:** `npm start`
- **Development Mode:** `npm run dev`
- **Generate Test Contacts:** `npm run generate-contacts`

---



