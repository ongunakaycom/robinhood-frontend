# CryptoAnalysisAI - Data-Driven Crypto Analysis ChatBot

A React-based frontend application for a stock trading platform, inspired by Robinhood. This project demonstrates modern React development with organized components, state management, and multi-language support.

You can **try the live app** here: [robinhoodapp-65342.web.app](https://robinhoodapp-65342.web.app)

---

## Table of Contents

* [Features](#features)
* [Project Structure](#project-structure)
* [Technologies](#technologies)
* [Getting Started](#getting-started)
* [Running the App](#running-the-app)
* [Folder Overview](#folder-overview)
* [Notes](#notes)
* [User Testing](#user-testing)

---

## Features

* Fully componentized React frontend
* State management using custom stores (`accountStore`, `tradeStore`)
* Multi-language support (English, Spanish)
* Authentication (Sign In, Sign Up, Password Recovery, Verification)
* Dashboard with account settings and user interactions
* Real-time chat interface components (`ChatContainer`, `MessageList`, `ChatInput`)
* Responsive layout with reusable UI components
* Cookie disclaimer and protected routes

---

## Project Structure

```
src/
├── components/        # Reusable UI and page components
├── Databases/         # Local database or mock logic
├── Locales/           # Translation files (i18n)
├── store/             # State management
├── App.js             # Root component
├── index.js           # App entry point
└── ...                # Other supporting files
```

### Key Components

* **Dashboard** – Main user interface for account overview and trades
* **WelcomePage** – Landing page with Sign In / Sign Up / Verification
* **ChatContainer** – Real-time chat feature (frontend only)
* **Alert** – Reusable alert/notification component
* **Footer** – Page footer component
* **I18** – Internationalization setup

---

## Technologies

* **React** – Frontend library
* **CSS Modules / CSS** – Component-level styling
* **JavaScript (ES6+)** – Core logic
* **React Router** – Navigation and protected routes
* **Firebase** – Backend integration (frontend connected, backend not included for security)

---

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/ongunakaycom/robinhood-frontend.git
```

2. Navigate into the project directory:

```bash
cd robinhood-frontend
```

3. Install dependencies:

```bash
npm install
# or
yarn install
```

---

## Running the App

```bash
npm start
# or
yarn start
```

The app will run on `http://localhost:3000`.

You can also **access the live demo** here: [robinhoodapp-65342.web.app](https://robinhoodapp-65342.web.app)

---

## Notes

* The backend for this project is Python-based and deployed on Render. For security reasons, backend code is not included.
* This project focuses on frontend architecture, component design, state management, and React best practices.
* Internationalization is available for English, Spanish, and Ukrainian.

---

## User Testing

* Users can interact with the live demo on Firebase to test authentication, dashboard features, and the chat interface.
* Feedback is welcome to improve usability, component performance, and UI design.