# Backend Server

This is a Node.js backend server application.

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Node.js installed on your machine
- Git installed on your machine

## Getting Started

To get a local copy of this project up and running, follow these steps:

### 1. Create a Directory

First, create a directory where you want to clone the project source code:

```bash
mkdir <directory-name>
cd <directory-name>
```

### 2. Clone the Repository

Next, clone this repository into your newly created directory:

```bash
git clone <repository-url> .
```

### 3. Install Dependencies

Navigate to the project directory and install the necessary Node.js packages:

```bash
npm install
```

### 4. Start the Server

Finally, start the server in development environment:

```bash
npm run dev
```

The server should now be running, and you can access it at `http://localhost:5000`

## Environment Variables

This project uses environment variables stored in a `.env` file. Make sure to create this file in the root of your project and add the required variables.

## Folder Structure

- `./src/`: Directory for the source code.

- `./src/middlewares/public/temp`: Directory for file uploads.
