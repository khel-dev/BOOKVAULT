# 📚 BookVault

**Professional Bookkeeping Management Platform** - Built with Firebase & JavaScript

> A modern bookkeeping application for managing clients, billing, and financial records. No backend required - powered by Firebase.

## ✨ Features

- 🔐 **Secure Authentication** - Email/password login with Firebase Auth
- 📊 **Client Management** - Add, edit, and track clients
- 💰 **Billing Management** - Create and manage billing statements
- 📑 **Archive System** - Store and organize financial documents
- 🔔 **Notifications** - Real-time alerts and updates
- ⚙️ **Settings** - Customize preferences and account settings
- 🌐 **Real-time Sync** - Firestore keeps data synced across devices

## 🚀 Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Vanilla JavaScript, HTML, CSS |
| **Backend** | Firebase (no server needed) |
| **Database** | Firestore (NoSQL, real-time) |
| **Authentication** | Firebase Auth |
| **Deployment** | Firebase Hosting or any web server |

## 📁 Project Structure

```
BOOKVAULT/
├── public/                  # Web files (deployed)
│   ├── index.html          # Landing page
│   ├── app/                # Application pages
│   └── assets/             # CSS, JS, images
├── docs/                   # Documentation
│   ├── STRUCTURE.md        # Folder structure overview
│   ├── SETUP.md           # Setup instructions ⭐
│   ├── FIREBASE-RULES.md  # Security rules
│   └── API.md             # Service API docs
└── README.md              # This file
```

## ⚡ Quick Start

### 1. Prerequisites
- Firebase project created (with Email/Password auth enabled and Firestore database)
- Firebase config credentials
- Modern web browser

### 2. Configure Firebase
Edit `public/assets/js/firebase/firebaseConfig.js`:
```javascript
window.__BOOKVAULT_FIREBASE_CONFIG__ = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-app.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-app.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### 3. Set Firestore Rules
Copy security rules from `docs/FIREBASE-RULES.md` to Firebase Console → Firestore → Rules

### 4. Run Locally
```bash
# Using Python 3
python -m http.server 8000

# Then open: http://localhost:8000/BOOKVAULT/public/
```

### 5. Test Registration
- Go to landing page (`/index.html`)
- Click "Register"
- Complete 3-step registration
- Check Firebase Console for new user

📖 **Full setup guide**: See [docs/SETUP.md](docs/SETUP.md)

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [**SETUP.md**](docs/SETUP.md) | Step-by-step setup instructions ⭐ **START HERE** |
| [**STRUCTURE.md**](docs/STRUCTURE.md) | Project folder structure & architecture |
| [**FIREBASE-RULES.md**](docs/FIREBASE-RULES.md) | Firestore security rules to set up |
| [**API.md**](docs/API.md) | Complete services API reference |

## 🔄 How It Works

### Authentication Flow
```
User fills registration form
         ↓
Data stored in sessionStorage
         ↓
Submit credentials to Firebase Auth
         ↓
User account created + profile stored in Firestore
         ↓
User logged in, redirect to dashboard
```

### Data Management
```
Frontend (Vanilla JS)
         ↓
authService.js (Firebase Auth operations)
         ↓
userDataService.js (Firestore CRUD operations)
         ↓
Firebase Firestore (Real-time database)
```

## 🛠 Services

### AuthService
Handles user authentication:
```javascript
await authService.register(email, password, userData)  // Create account
await authService.login(email, password)               // Login
await authService.logout()                             // Logout
authService.isLoggedIn()                              // Check status
```

### UserDataService
Manages user data:
```javascript
await userDataService.addClient(uid, clientData)           // Add client
await userDataService.getClients(uid)                      // Fetch clients
await userDataService.addBillingRecord(uid, billData)      // Add billing
await userDataService.updateSettings(uid, settings)        // Update settings
```

📚 Full API docs: [docs/API.md](docs/API.md)

## 🗂 Firestore Schema

```
users/
├── {uid}/
│   ├── email, firstName, lastName, businessName...
│   ├── clients/
│   ├── billing/
│   ├── archives/
│   ├── notifications/
│   └── settings/
```

Each user's data is private and isolated in Firestore.

## 🔐 Security

- ✅ Firebase Auth protects user accounts
- ✅ Firestore security rules prevent data access between users
- ✅ Passwords never exposed in code
- ✅ HTTPS required for production

See [docs/FIREBASE-RULES.md](docs/FIREBASE-RULES.md) for security rules.

## 📊 Pages

| Page | Purpose | Route |
|------|---------|-------|
| Landing | Homepage | `/` |
| Login | User login | `/app/login.html` |
| Registration (3-step) | Account creation | `/app/registration_personal.html` |
| Dashboard | Main app (create) | `/app/dashboard.html` |
| Clients | Manage clients | `/app/clients.html` |
| Billing | Billing statements | `/app/billing.html` |
| Archive | Document storage | `/app/archive.html` |
| Settings | User preferences | `/app/settings.html` |
| Debug | Firebase status | `/debug.html` |

## 🚀 Deployment

### Option 1: Firebase Hosting (Recommended)
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Option 2: Any Web Server
Copy `public/` folder to your server. Requires HTTPS for Firebase.

### Option 3: GitHub Pages
Push to GitHub, enable Pages, but remember HTTPS is required.

## 🐛 Troubleshooting

**Q: "Firebase initializing..." message won't go away?**
- Check `public/debug.html` to see Firebase status
- Verify Firebase config is correct in `firebaseConfig.js`
- Check browser console (F12) for errors

**Q: Registration not working?**
- Ensure Firestore security rules are published
- Check Firestore database exists
- Verify Email/Password auth is enabled in Firebase

**Q: Data not saving to Firestore?**
- Check Firestore rules allow writes (see FIREBASE-RULES.md)
- Verify user is authenticated
- Open browser DevTools console for error messages

See [docs/SETUP.md](docs/SETUP.md) **Troubleshooting** section for more.

## 📱 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📝 Development Notes

- **No build tooling needed** - vanilla JS, HTML, CSS
- **No server required** - Firebase handles backend
- **Real-time updates** - Firestore syncs data automatically
- **Open source** - Feel free to extend and customize

## 🎯 Next Steps

1. ✅ Follow [docs/SETUP.md](docs/SETUP.md) to get running
2. 📄 Create dashboard page in `public/app/dashboard.html`
3. 📝 Create page scripts in `public/assets/js/pages/`
4. 🎨 Customize styling in `public/assets/css/`
5. 🚀 Deploy to Firebase Hosting or web server

## 📞 Support

- 📖 Check docs in `/docs` folder
- 🐛 Use `public/debug.html` to diagnose issues
- 🔍 Check browser console (F12 → Console tab)
- 📚 See [Firebase Documentation](https://firebase.google.com/docs)

## 📄 License

Private project. All rights reserved.

---

**Ready to get started?** → **[Go to SETUP.md →](docs/SETUP.md)**

Made with 💙 for bookkeepers
