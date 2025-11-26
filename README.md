# Secure Data Visualization Portal

A production-ready web application for secure data visualization. Administrators can upload CSV/Excel files, and authenticated users can view the data in a responsive table.

## Features

- **Authentication**: Secure Email/Password login via Firebase Auth.
- **Role Management**: First user is Admin, subsequent users are Viewers.
- **Admin Dashboard**: Drag-and-drop file upload (CSV/XLSX), data preview, and publishing.
- **User Dashboard**: View published data with search and pagination.
- **Security**: Protected routes and Firestore security rules.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **DevOps**: Docker, Pixi

## Setup & Installation

### Prerequisites

- [Pixi](https://prefix.dev/) (recommended) or Node.js 20+
- Firebase Project

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd data_visualisation_portal
   ```

2. **Install dependencies**
   ```bash
   pixi install
   # OR
   npm install
   ```

3. **Configure Firebase**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
   - Enable **Authentication** (Email/Password provider).
   - Enable **Firestore Database**.
   - Copy your web app configuration keys.
   - Create a `.env` file in the root directory:
     ```env
     VITE_FIREBASE_API_KEY=your_api_key
     VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
     VITE_FIREBASE_PROJECT_ID=your_project_id
     VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
     VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
     VITE_FIREBASE_APP_ID=your_app_id
     ```

4. **Run the application**
   ```bash
   pixi run dev
   # OR
   npm run dev
   ```

## Deployment

### Option A: Serverless (Vercel/Netlify)

1. **Build the project**
   ```bash
   npm run build
   ```
2. **Deploy**
   - Connect your repository to Vercel or Netlify.
   - Set the **Build Command** to `npm run build`.
   - Set the **Output Directory** to `dist`.
   - **Important**: Add the Environment Variables from your `.env` file to the deployment platform settings.

### Option B: Docker Container

1. **Build the image**
   ```bash
   docker build -t data-portal .
   ```

2. **Run the container**
   ```bash
   docker run -p 8080:80 data-portal
   ```
   *Note: For production, you should pass environment variables to the container or bake them in (carefully).*

## Security Rules

Deploy the following rules to your Firestore Database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() { return request.auth != null; }
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if isAuthenticated() && request.auth.uid == userId;
      allow create: if isAuthenticated() && request.auth.uid == userId;
    }

    match /public_data/{document=**} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```
