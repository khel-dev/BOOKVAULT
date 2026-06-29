# 📚 BookVault Project Structure

## Overview
BookVault is a modern bookkeeping platform built with **Firestore** (no PHP backend). All data is stored in Firebase, authentication is managed by Firebase Auth, and the frontend is vanilla JavaScript.

## Folder Structure

```
BOOKVAULT/
├── public/                          # Frontend (deployed to web server)
│   ├── index.html                   # Landing page
│   ├── debug.html                   # Firebase debug console
│   ├── assets/
│   │   ├── css/                     # Stylesheets
│   │   │   ├── landing.css
│   │   │   ├── login.css
│   │   │   ├── dashboard.css
│   │   │   └── ...other pages
│   │   ├── js/
│   │   │   ├── firebase/            # Firebase services
│   │   │   │   ├── firebaseConfig.js      # Configuration
│   │   │   │   ├── firebaseInit.js        # Initialization
│   │   │   │   ├── authService.js         # Auth logic
│   │   │   │   └── userDataService.js     # Firestore CRUD
│   │   │   ├── pages/               # Page-specific scripts
│   │   │   │   ├── dashboard.js
│   │   │   │   ├── clients.js
│   │   │   │   └── ...other pages
│   │   │   ├── landing.js           # Landing page logic
│   │   │   ├── login.js             # Login page logic
│   │   │   ├── registration_*.js    # Registration pages
│   │   │   └── utils.js             # Shared utilities (optional)
│   │   └── img/                     # Images, icons
│   └── app/                         # Application pages
│       ├── login.html
│       ├── dashboard.html
│       ├── clients.html
│       ├── billing.html
│       ├── archive.html
│       ├── settings.html
│       ├── notifications.html
│       ├── help.html
│       ├── registration_personal.html
│       ├── registration_business.html
│       └── registration_account.html
│
├── docs/                            # Documentation
│   ├── STRUCTURE.md                 # This file
│   ├── SETUP.md                     # Setup instructions
│   ├── FIREBASE-RULES.md            # Firestore security rules
│   └── API-REFERENCE.md             # Service API docs
│
├── .gitignore                       # Git ignore rules
├── README.md                        # Main README
└── .git/                            # Git repository

```

## Key Changes from Old PHP Backend

### ❌ Removed (No longer needed)
- `backend/api/` - PHP API endpoints
- `backend/config/` - PHP configuration
- `backend/database/` - Database schema files
- `backend/includes/` - PHP includes

### ✅ New Firebase-based approach
- **Authentication**: Firebase Auth (email/password)
- **Database**: Firestore (NoSQL, real-time)
- **Backend Logic**: JavaScript services (`authService.js`, `userDataService.js`)
- **Data Management**: All client-side with Firebase SDK

## Frontend Architecture

### Service Layer (`public/assets/js/firebase/`)

#### `authService.js`
Handles user authentication:
```javascript
// Register user
await authService.register(email, password, userData)

// Login user
await authService.login(email, password)

// Logout
await authService.logout()

// Get current user
authService.getCurrentUser()
authService.getCurrentUserId()
authService.isLoggedIn()
```

#### `userDataService.js`
Manages data in Firestore:
```javascript
// Clients
await userDataService.addClient(userId, clientData)
await userDataService.getClients(userId)
await userDataService.deleteClient(userId, clientId)

// Billing
await userDataService.addBillingRecord(userId, billingData)
await userDataService.getBillingRecords(userId)

// Notifications
await userDataService.addNotification(userId, data)
await userDataService.getNotifications(userId)

// Settings
await userDataService.updateSettings(userId, settings)
await userDataService.getSettings(userId)
```

### Page Structure

Each page follows this pattern:
```
public/
├── app/
│   ├── [page].html              # HTML structure
│   └── ../assets/
│       ├── css/[page].css       # Styles
│       └── js/pages/[page].js   # Logic
```

**Example**: Dashboard page
- `public/app/dashboard.html` - HTML markup
- `public/assets/css/dashboard.css` - Styles
- `public/assets/js/pages/dashboard.js` - JavaScript logic (uses `authService` and `userDataService`)

## Firestore Database Schema

```
users/
├── {uid}/
│   ├── email: string
│   ├── firstName: string
│   ├── lastName: string
│   ├── businessName: string
│   ├── phone: string
│   ├── gender: string
│   ├── certification: string
│   ├── createdAt: timestamp
│   ├── updatedAt: timestamp
│   ├── lastLogin: timestamp
│   │
│   ├── clients/
│   │   └── {clientId}
│   │       ├── name: string
│   │       ├── email: string
│   │       ├── phone: string
│   │       ├── address: string
│   │       ├── createdAt: timestamp
│   │       └── ...
│   │
│   ├── billing/
│   │   └── {billingId}
│   │       ├── amount: number
│   │       ├── status: string
│   │       ├── dueDate: timestamp
│   │       └── ...
│   │
│   ├── archives/
│   │   └── {archiveId}
│   │       ├── title: string
│   │       ├── content: string
│   │       └── ...
│   │
│   ├── notifications/
│   │   └── {notificationId}
│   │       ├── message: string
│   │       ├── read: boolean
│   │       ├── createdAt: timestamp
│   │       └── ...
│   │
│   └── settings/
│       └── preferences
│           ├── theme: string
│           ├── notifications: boolean
│           └── ...
```

## Getting Started

1. **Firebase Configuration**
   - Configure Firebase credentials in `public/assets/js/firebase/firebaseConfig.js`
   - Set Firestore security rules (see `docs/FIREBASE-RULES.md`)

2. **Development**
   - All frontend code is in `public/`
   - No build step needed (vanilla JS)
   - Open `public/index.html` or use a local server

3. **Deployment**
   - Deploy `public/` folder to Firebase Hosting or any web server
   - Firebase Auth and Firestore handle backend logic

## Script Loading Order

Important: Scripts must load in this order:
1. Firebase SDK (`firebaseApp.js`, `firebaseAuth.js`, `firebaseFirestore.js`)
2. Config (`firebaseConfig.js`)
3. Init (`firebaseInit.js`)
4. Services (`authService.js`, `userDataService.js`)
5. Page scripts

See `public/index.html` for example.

## Navigation

- **Public pages**: `public/index.html` (landing)
- **Auth pages**: `public/app/login.html`, `public/app/registration_*.html`
- **App pages**: `public/app/dashboard.html`, `public/app/clients.html`, etc.
- **Debug**: `public/debug.html` (Firebase status)

---

📝 For more details, see other docs in `docs/` folder.
