# Dr Jinnit’s Clinic Patient Management System

A secure, responsive patient management system designed for Dr. Jinita Galaiya.

## Features
- **Public Patient Intake**: Responsive form replicating the clinic's Google Form.
- **Doctor's Dashboard**: Secure admin area to view patients and add analysis.
- **AI Analysis Engine**: Advanced rule-based engine that suggests top 5 remedies with differentiation tables based on comprehensive patient data.
- **Data Privacy**: Local SQLite database with encryption-ready structure.

## Prerequisites
- Node.js (v14 or higher)

## Installation
1.  Clone or download this repository.
2.  Open a terminal in the project folder.
3.  Run `npm install` to install dependencies.

## Usage
1.  **Start the server**:
    ```bash
    npm run dev
    ```
2.  **Patient Form (Public)**:
    - Open `http://localhost:3000` to fill the comprehensive case record.
3.  **Doctor Dashboard (Admin)**:
    - URL: `http://localhost:3000/admin/login`
    - **Username**: `DrJinita` (or as set in `.env`)
    - **Password**: `securepassword123` (or as set in `.env`)

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: SQLite (`better-sqlite3`)
- **Frontend**: EJS, Tailwind CSS
