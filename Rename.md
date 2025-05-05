![Screenshot 2025-05-05 at 19.37.45.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.45.png)
![Screenshot 2025-05-05 at 19.37.12.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.12.png)
![Screenshot 2025-05-05 at 19.37.20.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.20.png)
![Screenshot 2025-05-05 at 19.37.39.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.39.png)
![Screenshot 2025-05-05 at 19.37.32.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.32.png)
![Screenshot 2025-05-05 at 19.37.59.png](..%2FDesktop%2FScreenshot%202025-05-05%20at%2019.37.59.png)

# Expin - Personal Budget Tracker

Expin is a personal budget tracker that helps users manage their income, expenses, and savings. This project uses a frontend built with React and a backend powered by FastAPI, with MongoDB for data storage.

## Features

- **User Registration & Login:** Secure authentication using Auth0.
- **Track Income & Expenses:** Easily log income and expenses to monitor financial health.
- **Interactive Charts:** Visualize spending patterns with interactive charts.
- **Recommendations:** Personalized financial advice based on spending habits.

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** FastAPI
- **Database:** MongoDB
- **Authentication:** Auth0
- **Containerization:** Docker

## Setup Instructions

### Prerequisites

Make sure you have the following installed:

- Docker
- Node.js (for frontend development)
- Python (for backend development)

### Frontend Setup

1. Navigate to the `frontend` directory:

   ```bash
   cd frontend


Install dependencies:


npm install
Start the development server:

npm run dev
The frontend should now be running on http://localhost:3012.

Backend Setup
Navigate to the backend directory:

cd backend
Install dependencies:


pip install -r requirements.txt
Start the FastAPI server:

uvicorn app.main:app --reload
The backend API should now be running on http://localhost:8000.

Running with Docker
To run the application using Docker, you can use Docker Compose:

docker-compose up --build
This will build and start all the necessary services (frontend, backend, MongoDB) in separate containers.

Environment Variables
Make sure to configure the following environment variables in your .env file:

MONGODB_URI: MongoDB connection string.

AUTH0_DOMAIN: Auth0 domain for authentication.

AUTH0_CLIENT_ID: Auth0 client ID.

AUTH0_CLIENT_SECRET: Auth0 client secret.

GEMINI_API_KEY: API key for financial recommendations.

Docker Setup
Services
mongo: MongoDB container for storing user data and transactions.

frontend: React-based frontend served by Vite.

backend: FastAPI backend for handling user authentication, transactions, and recommendations.

Volumes
mongo-data: Persistent volume for MongoDB data.

Ports
Frontend: Exposes port 3012.

Backend: Exposes port 8000.

MongoDB: Exposes port 27017.

License
This project is licensed under the MIT License - see the LICENSE file for details.



### Разбор разделов:
1. **Описание проекта:** краткая информация о том, что делает проект.
2. **Функции:** основные возможности проекта.
3. **Технологии:** перечень используемых технологий.
4. **Инструкции по настройке:** шаги, как настроить и запустить проект.
5. **Переменные окружения:** какие переменные нужны для конфигурации.
6. **Docker Setup:** описание контейнеров и настройки для Docker.
7. **Лицензия:** если ты добавил лицензию, можно указать её здесь.

https://github.com/elcIdeal/AdvPmProject 