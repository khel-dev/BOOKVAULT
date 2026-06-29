# 🚀 BookVault Setup Guide

## Prerequisites

- ✅ Firebase Console project created (BookVault App)
- ✅ Email/Password authentication enabled
- ✅ Firestore database created
- ✅ Firebase config obtained

## Step 1: Firebase Configuration

1. **Get your Firebase config**
   - Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Settings ⚙️
   - Select **"Your apps"** → **"Web"** (BookVault)
   - Copy the config object

2. **Update `public/assets/js/firebase/firebaseConfig.js`**
   ```javascript
   window.__BOOKVAULT_FIREBASE_CONFIG__ = {
     apiKey: "YOUR_API_KEY",
     authDomain: "your-app.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-app.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID",
     measurementId: "YOUR_MEASUREMENT_ID"
   };
   ```

## Step 2: Enable Authentication

1. Go to **Firebase Console → Authentication**
2. Click **Sign-in method** tab
3. Enable **Email/Password**
4. Save

## Step 3: Create Firestore Database

1. Go to **Firebase Console → Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Select region closest to you
5. Create

## Step 4: Set Firestore Security Rules

1. Go to **Firestore → Rules** tab
2. Paste the rules from `docs/FIREBASE-RULES.md`
3. Click **Publish**

## Step 5: Test the Application

### Option A: Using Local Server (Recommended)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```
Then visit: `http://localhost:8000/BOOKVAULT/public/`

### Option B: Direct File
```
Open: file:///c:/Users/Queljayver/Desktop/BOOKVAULT/public/index.html
```
(Note: Firebase may have issues with `file://` protocol)

### Option C: Extract to Web Server
- Copy `public/` folder to your web server
- Access via HTTPS (Firebase requires it)

## Step 6: Verify Setup

1. Open **Debug Console**
   - `http://your-server/BOOKVAULT/public/debug.html`
   - Check if all components are ✓ green

2. Test Registration
   - Click "Register" on landing page
   - Fill out 3-step registration
   - Check Firebase Console → Authentication for new user

3. Test Login
   - Use the credentials you just created
   - Should redirect to dashboard

4. Check Firestore
   - Go to Firebase Console → Firestore
   - Look in `users/` collection
   - Should see your user document with profile data

## Troubleshooting

### "Firebase not configured"
- ✅ Check `firebaseConfig.js` has all 6+ credentials
- ✅ Verify Firebase SDK scripts loaded (F12 → Console)
- ✅ Check browser console for errors

### "Username not available / Firebase initializing..."
- This is now fixed! Users can create accounts directly without username checks.
- If slow, wait 2-3 seconds for Firebase to initialize

### "Network error" on registration
- ✅ Check Firestore security rules are published
- ✅ Verify Firestore database exists
- ✅ Check browser console for specific errors

### Registration works but no user in Firebase
- ✅ User created in **Authentication** tab ✓
- ✅ User document created in **Firestore** → `users/` collection ✓
- ✅ Check Firestore rules allow writes

## Project Structure

```
public/
├── index.html                        # Landing page
├── debug.html                        # Debug console
├── app/
│   ├── login.html                    # Login
│   ├── dashboard.html                # Main dashboard (create this)
│   ├── clients.html                  # Client management
│   ├── billing.html                  # Billing
│   ├── archive.html                  # Document archive
│   ├── settings.html                 # User settings
│   ├── notifications.html            # Notifications
│   ├── help.html                     # Help page
│   ├── registration_personal.html    # Step 1
│   ├── registration_business.html    # Step 2
│   └── registration_account.html     # Step 3 (now creates account)
└── assets/
    ├── js/
    │   ├── firebase/
    │   │   ├── firebaseConfig.js      # ← Update with your config
    │   │   ├── firebaseInit.js
    │   │   ├── authService.js
    │   │   └── userDataService.js
    │   ├── pages/                     # Page-specific scripts (create these)
    │   ├── landing.js
    │   ├── login.js
    │   └── registration_*.js
    └── css/
        └── *.css                      # Existing stylesheets
```

## Next Steps

1. ✅ Setup complete!
2. 📄 Create `public/app/dashboard.html` (main app screen)
3. 📝 Create page scripts in `public/assets/js/pages/`
4. 🎨 Add more styling as needed
5. 🚀 Deploy to Firebase Hosting or web server

## Quick Links

- 📚 [Firestore Documentation](https://firebase.google.com/docs/firestore)
- 🔐 [Firebase Auth Docs](https://firebase.google.com/docs/auth)
- 🌐 [Firebase Console](https://console.firebase.google.com)
- 📖 [Project Structure](STRUCTURE.md)

---

💡 **Having issues?** Check `public/debug.html` first - it shows exactly what's working and what's not!
