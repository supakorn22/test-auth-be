# test-auth-be

This project is a backend for testing authentication and authorization using Node.js.

## Getting Started

To set up the project after cloning it from Git, follow these steps:

### Prerequisites

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- [Docker](https://www.docker.com/) (Docker Desktop)
- [mkcert](https://github.com/FiloSottile/mkcert) (Optional, for HTTPS)


### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/supakorn22/test-auth-be.git
   cd test-auth-be
   ```
2. Create a .env file in the root of the project with the following content:
    ```bash
    PORT=8080 # Optional, default is 8080
    MONGO_INITDB_ROOT_USERNAME=your_username
    MONGO_INITDB_ROOT_PASSWORD=your_password
    MONGO_DB_NAME=your_database_name
    ```
3. Install the project dependencies:
    ```bash
    npm install
    ```
4. Set up Docker:
   - Install Docker (Docker Desktop) on your machine if you haven't already.
   - Build and start the Docker container: 
    ```bash
    docker-compose up -d
    ```
5. Start the application:
    - For development: ` npm run dev `
    - For nodemon: `npm run nodemon` or `nodemon`
    
**Optional: Enable HTTPS**
If you want to use HTTPS, follow these steps:
1. Install mkcert:
   - On Windows, it's recommended to use chocolatey:
    ```bash
    choco install mkcert
    ```
    - On macOS, use brew:
    ```bash
    brew install mkcert
    ```
2. Generate certificates:
    ```bash
    cd src
    mkcert -install
    mkcert localhost
to use HTTPS use https://localhost8081 or you can config to any you want in .env `PORT_HTTPS`.


# API Documentation

## Endpoints

| Method | Endpoint    | Description                        | Parameters                                                      | Response                       |
|--------|-------------|------------------------------------|-----------------------------------------------------------------|-------------------------------|
| POST   | /auth/register   | Register a new user                | { "username": "string", "password": "string", "email": "string", "role": "string" } | JSON object of created user    |
| POST   | /auth/login      | Login a user                       | { "username": "string", "password": "string" }                   | JSON object with JWT token     |
| GET    | /auth/me         | Get current user information       | None (JWT token in header)                                       | JSON object of the user        |
| GET    | /auth/logout     | Logout the current user            | None                                                            | JSON object with logout status |
