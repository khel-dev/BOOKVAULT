# 📊 BookVault Defense - Visual Flowcharts

**Diagrams & Flowcharts para madaling maintindihan**

---

## 🎯 FLOWCHART 1: COMPLETE USER JOURNEY

```
                          ┌─────────────┐
                          │   START     │
                          └──────┬──────┘
                                 │
                    ┌────────────┴────────────┐
                    │                        │
              [New User]            [Existing User]
                    │                        │
                    ↓                        ↓
           ┌──────────────────┐     ┌──────────────┐
           │ REGISTRATION     │     │ LOGIN        │
           │ (3 steps)        │     │              │
           │ 1. Personal info │     │ Email: ___   │
           │ 2. Business data │     │ Pass: ____   │
           │ 3. Account setup │     │ [Login Btn]  │
           └────────┬─────────┘     └──────┬───────┘
                    │                      │
                    └──────────┬───────────┘
                               │
                        FIREBASE VALIDATION
                        ✓ Email verified
                        ✓ Password encrypted
                        ✓ User UID created
                        ✓ Profile stored
                               │
                    ┌──────────┴──────────┐
                    │                     │
                  SUCCESS             FAILURE
                    │                     │
                    ↓                     ↓
            ┌──────────────┐     ┌──────────────┐
            │  DASHBOARD   │     │  LOGIN PAGE  │
            │  (Logged In) │     │  Error Msg   │
            └──────┬───────┘     │  Retry       │
                   │             └──────────────┘
        ┌──────────┼──────────┐
        │          │          │          │           │
    [CLIENTS]  [BILLING]  [ARCHIVE] [NOTIFY]  [SETTINGS]
        │          │          │          │           │
        ↓          ↓          ↓          ↓           ↓
       ┌──────────────────────────────────────────────┐
       │  CREATE / READ / UPDATE / DELETE OPERATIONS  │
       │  All saved to Firebase Firestore Database    │
       └──────────────────────────────────────────────┘
        │          │          │          │           │
        └──────────┼──────────┴─────────┬┴───────────┘
                   │                    │
              [LOGOUT BUTTON]           │
                   │                    │
                   └────────┬───────────┘
                            │
                   ┌────────┴────────┐
                   │ LOGOUT PROCESS  │
                   ├─────────────────┤
                   │ 1. Sign out     │
                   │ 2. Clear storage│
                   │ 3. Redirect     │
                   └────────┬────────┘
                            │
                            ↓
                   ┌──────────────────┐
                   │  LOGIN PAGE      │
                   │  (Reset)         │
                   └──────┬───────────┘
                          │
                       [END]
```

---

## 📤 FLOWCHART 2: SAVING CLIENT DATA

```
USER ACTION: Clicks "Save Client"
            │
            ↓
    ┌──────────────────┐
    │ Form appears:    │
    │ - Business Name  │
    │ - Email          │
    │ - Phone          │
    │ - Monthly Fee    │
    │ [Save] [Cancel]  │
    └────────┬─────────┘
             │
        User fills
        & clicks Save
             │
             ↓
    ┌────────────────────────────┐
    │ JavaScript Function Runs:  │
    │ saveOrUpdateClient()       │
    └────────┬───────────────────┘
             │
             ├─ Step 1: Get form values
             │   businessName = input.value
             │   email = input.value
             │   phone = input.value
             │   monthlyFee = input.value
             │
             ├─ Step 2: Validate
             │   if (!businessName) { alert("Required!"); return; }
             │   if (!email) { alert("Required!"); return; }
             │
             ├─ Step 3: Get user ID
             │   uid = localStorage.registeredUser.uid
             │
             ├─ Step 4: Call Service
             │   userDataService.addClient(uid, {
             │     businessName,
             │     email,
             │     phone,
             │     monthlyFee,
             │     status: "active"
             │   })
             │
             ↓
    ┌────────────────────────────┐
    │ FIREBASE REQUEST SENT       │
    │ Via HTTPS (encrypted)      │
    │ TO: Firestore Database     │
    └────────┬───────────────────┘
             │
             ├─ Firebase receives request
             ├─ Check 1: User authenticated?
             │   if (request.auth.uid == userId) ✓
             │
             ├─ Check 2: Valid data?
             │   if (data.businessName) ✓
             │   if (data.email) ✓
             │
             ├─ Check 3: Permission check?
             │   Firestore Rules say:
             │   "Only owner can write"
             │   This user = owner? ✓
             │
             ↓
    ┌────────────────────────────┐
    │ FIRESTORE SAVES DOCUMENT   │
    │                            │
    │ Location:                  │
    │ /users/{uid}/clients/      │
    │                            │
    │ Document:                  │
    │ {                          │
    │   id: "c123xyz",           │
    │   businessName: "ABC Corp",│
    │   email: "...",            │
    │   phone: "...",            │
    │   monthlyFee: 5000,        │
    │   status: "active",        │
    │   createdAt: 2026-05-13    │
    │ }                          │
    └────────┬───────────────────┘
             │
             ├─ Document created ✓
             ├─ Timestamp recorded ✓
             ├─ Data indexed ✓
             │
             ↓
    ┌────────────────────────────┐
    │ FIREBASE RESPONSE SENT      │
    │ Back to Frontend (HTTPS)    │
    │ Returns: {                 │
    │   success: true,           │
    │   clientId: "c123xyz"      │
    │ }                          │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │ JavaScript Continues:      │
    │                            │
    │ Step 5: Handle response    │
    │   alert("Saved!")          │
    │                            │
    │ Step 6: Close modal        │
    │   closeAddClientModal()    │
    │                            │
    │ Step 7: Refresh list       │
    │   loadClientsFromFirestore()
    │                            │
    │ Step 8: Update page        │
    │   renderClients()          │
    └────────┬───────────────────┘
             │
             ↓
    ┌────────────────────────────┐
    │ USER SEES:                 │
    │                            │
    │ ✓ Success message          │
    │ ✓ Modal closes             │
    │ ✓ List refreshes           │
    │ ✓ New client appears       │
    └────────────────────────────┘
```

---

## 📥 FLOWCHART 3: LOADING CLIENT DATA

```
USER NAVIGATES TO: clients.html
        │
        ↓
┌────────────────────────────┐
│ HTML page loads            │
│ Scripts start executing    │
└────────┬───────────────────┘
         │
         ├─ firebaseInit.js → Firebase ready
         ├─ authService.js → Auth ready
         ├─ userDataService.js → Data service ready
         │
         ↓
┌────────────────────────────┐
│ DOMContentLoaded fires     │
│ clients.js runs            │
└────────┬───────────────────┘
         │
         ├─ Step 1: Check authentication
         │   if (!getUid()) {
         │     redirect to login.html;
         │   }
         │
         ├─ Step 2: Get user ID
         │   uid = localStorage.registeredUser.uid
         │   // Example: "abc123xyz789"
         │
         ├─ Step 3: Show loading state
         │   Display: "Loading clients..."
         │
         ├─ Step 4: Call service
         │   const clients = await
         │     userDataService.getClients(uid)
         │
         ↓
┌────────────────────────────┐
│ FIREBASE REQUEST SENT      │
│ Query: GET all clients     │
│ for this user              │
└────────┬───────────────────┘
         │
         ├─ Firebase receives request
         ├─ Check: User authenticated?
         │   if (request.auth.uid == userId) ✓
         │
         ├─ Query: Get documents at
         │   /users/{uid}/clients/
         │
         ↓
┌────────────────────────────┐
│ FIRESTORE QUERIES DATABASE│
│                            │
│ Search: /users/abc123xyz789
│         /clients/          │
│                            │
│ Found:                     │
│ [                          │
│   {                        │
│     id: "c1",              │
│     businessName: "ABC",   │
│     email: "a@email.com",  │
│     phone: "091234567"     │
│   },                       │
│   {                        │
│     id: "c2",              │
│     businessName: "XYZ",   │
│     email: "x@email.com",  │
│     phone: "098765432"     │
│   }                        │
│ ]                          │
└────────┬───────────────────┘
         │
         ├─ Array created
         ├─ Ordered by createdAt
         ├─ Returned to frontend
         │
         ↓
┌────────────────────────────┐
│ RESPONSE RECEIVED          │
│                            │
│ Array of 2 clients         │
│ Returned to JavaScript     │
└────────┬───────────────────┘
         │
         ├─ Step 5: Receive array
         │   clients = [c1, c2, ...]
         │
         ├─ Step 6: Remove loading state
         │   Hide: "Loading clients..."
         │
         ├─ Step 7: Loop through array
         │   for each client in clients:
         │     create HTML element
         │     add to page
         │
         ├─ Step 8: Render to page
         │   ┌──────────────────┐
         │   │ Client Card      │
         │   │ ┌──────────────┐ │
         │   │ │ ABC          │ │
         │   │ │ a@email.com  │ │
         │   │ │ 091234567    │ │
         │   │ │[View][Edit]  │ │
         │   │ └──────────────┘ │
         │   └──────────────────┘
         │   ┌──────────────────┐
         │   │ Client Card      │
         │   │ ┌──────────────┐ │
         │   │ │ XYZ          │ │
         │   │ │ x@email.com  │ │
         │   │ │ 098765432    │ │
         │   │ │[View][Edit]  │ │
         │   │ └──────────────┘ │
         │   └──────────────────┘
         │
         ↓
┌────────────────────────────┐
│ USER SEES CLIENT LIST      │
│ Ready to interact          │
│ Can click View/Edit buttons│
└────────────────────────────┘
```

---

## 🔐 FLOWCHART 4: LOGIN PROCESS

```
┌──────────────────────────┐
│ LOGIN PAGE               │
│ Email: [____________]    │
│ Pass:  [____________]    │
│ [LOGIN] [REGISTER]       │
└─────────┬────────────────┘
          │
      User enters
      email + password
      clicks LOGIN
          │
          ↓
┌──────────────────────────┐
│ JavaScript runs:         │
│ performLogin()           │
│                          │
│ Get form values:         │
│ email = "user@gmail.com" │
│ password = "pass123"     │
└─────────┬────────────────┘
          │
          ├─ Validate: email not empty?
          ├─ Validate: password not empty?
          ├─ Validate: email format ok?
          │
          ↓
┌──────────────────────────┐
│ CALL FIREBASE:           │
│                          │
│ authService.login(       │
│   email,                 │
│   password               │
│ )                        │
└─────────┬────────────────┘
          │
          ↓
┌──────────────────────────┐
│ FIREBASE RECEIVES        │
│ email + password         │
│                          │
│ Step 1: Find user        │
│   Query Auth DB:         │
│   Find record where      │
│   email == "user@..."    │
│                          │
│ Step 2: Verify password  │
│   Compare encrypted      │
│   passwords using bcrypt │
│   (never stores plain!)  │
│                          │
│ Step 3: Check account    │
│   Account active?        │
│   Email verified?        │
└─────────┬────────────────┘
          │
   ┌──────┴──────┐
   │             │
SUCCESS       FAILURE
   │             │
   ↓             ↓
┌───────────┐  ┌──────────────┐
│VALID!     │  │INVALID!      │
│           │  │              │
│Return:    │  │Error codes:  │
│{          │  │- user-not-   │
│ uid:      │  │  found       │
│"abc123",  │  │- wrong-      │
│ email:    │  │  password    │
│"user@...",│  │- too-many-   │
│ success:  │  │  requests    │
│ true      │  │              │
│}          │  │Return:       │
│           │  │{             │
│           │  │ error: "...",│
│           │  │ message: "..." 
│           │  │}             │
└─────┬─────┘  └──────┬───────┘
      │               │
      ↓               ↓
Save to      Show error
localStorage message
│               │
├─ uid          └─► "User not found"
├─ email            "Wrong password"
├─ firstName        "Too many attempts"
├─ lastName
├─ profile data
│
↓
Navigate to
dashboard.html

User sees:
"Welcome, [Name]!"
[Dashboard Page]
```

---

## 🔄 FLOWCHART 5: DATA SYNCHRONIZATION

```
┌─────────────────┐
│ Browser Session │
│ (Frontend)      │
└────────┬────────┘
         │
    ┌────┴────────────────────────────┐
    │                                 │
    ↓                                 ↓
┌──────────┐                   ┌─────────────┐
│Local UI  │                   │localStorage │
│Update    │                   │(User data)  │
│HTML      │                   │             │
│elements  │                   │ {           │
│          │                   │   uid:      │
│ Display  │                   │   email:    │
│ changes  │                   │   name:     │
│ instantly│                   │   profile:  │
│ to user  │                   │ }           │
└──────────┘                   └─────────────┘
    │                                 │
    │                                 │
    │         ASYNC OPERATIONS        │
    │                                 │
    └────────────┬────────────────────┘
                 │
                 ├─ Call Firestore API
                 ├─ Send data via HTTPS
                 ├─ Wait for response
                 │
                 ↓
    ┌────────────────────────────────┐
    │ Firebase Firestore Cloud       │
    │                                │
    │ ┌──────────────────────────┐   │
    │ │ /users/                  │   │
    │ │  ├─ abc123/              │   │
    │ │  │  ├─ profile data      │   │
    │ │  │  ├─ /clients/         │   │
    │ │  │  │  ├─ client1        │   │
    │ │  │  │  ├─ client2        │   │
    │ │  │  │  └─ ...            │   │
    │ │  │  └─ /billing/         │   │
    │ │  │     └─ ...            │   │
    │ │  │                        │   │
    │ │  └─ xyz789/              │   │
    │ │     └─ ... (other user)  │   │
    │ └──────────────────────────┘   │
    │                                │
    │ Real-time Synchronization:     │
    │ - Changes propagate instantly  │
    │ - All devices with same user   │
    │   see updates                  │
    │ - Offline changes sync later   │
    └────────────────────────────────┘
                 │
                 ├─ Process complete
                 ├─ Send success response
                 ├─ Back to browser
                 │
                 ↓
    ┌────────────────────────────────┐
    │ Browser receives response      │
    │                                │
    │ ├─ Success? YES/NO             │
    │ ├─ Updated data (if GET)       │
    │ ├─ New document ID (if CREATE) │
    │ ├─ Confirmation (if UPDATE)    │
    │ ├─ Deletion confirmation (if   │
    │ │  DELETE)                     │
    │ │                              │
    │ └─ Handle response             │
    │    - Update UI if needed       │
    │    - Show success/error msg    │
    │    - Refresh if necessary      │
    └────────────────────────────────┘
```

---

## 🛡️ FLOWCHART 6: SECURITY LAYERS

```
┌─────────────────────────────────────┐
│ LAYER 1: HTTPS ENCRYPTION           │
│                                     │
│ All data in transit encrypted       │
│ Browser ←→ Firebase                 │
│                                     │
│ Even if intercepted:                │
│ ❌ Can't read passwords             │
│ ❌ Can't read emails                │
│ ❌ Can't read client data           │
└─────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ LAYER 2: FIREBASE AUTHENTICATION    │
│                                     │
│ Step 1: Email must exist            │
│ Step 2: Password encrypted & checked│
│ Step 3: Account must be active      │
│                                     │
│ If ALL pass → UID issued            │
│ If ANY fails → Access denied        │
│                                     │
│ Bcrypt encryption:                  │
│ Passwords NEVER stored plain text   │
│ Even admins can't see passwords     │
└─────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ LAYER 3: FIRESTORE SECURITY RULES   │
│                                     │
│ Every request checked:              │
│                                     │
│ Rule 1: User authenticated?         │
│ if (request.auth.uid) ✓             │
│                                     │
│ Rule 2: User owns the data?         │
│ if (request.auth.uid ==             │
│     document.userId) ✓              │
│                                     │
│ Rule 3: Request valid?              │
│ if (data.format valid) ✓            │
│                                     │
│ If ANY rule fails → DENIED          │
└─────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ LAYER 4: DATA ISOLATION             │
│                                     │
│ User A: /users/userA/               │
│ ├─ profile: {only userA can access} │
│ ├─ /clients/: {only userA sees}     │
│ └─ /billing/: {only userA accesses} │
│                                     │
│ User B: /users/userB/               │
│ ├─ profile: {only userB can access} │
│ ├─ /clients/: {only userB sees}     │
│ └─ /billing/: {only userB accesses} │
│                                     │
│ Result:                             │
│ User A CANNOT see User B data       │
│ User B CANNOT see User A data       │
│ Even with valid UID                 │
└─────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────┐
│ LAYER 5: SESSION SECURITY           │
│                                     │
│ localStorage stores:                │
│ ✓ UID (unique identifier)           │
│ ✓ Email                             │
│ ✗ NO passwords                      │
│ ✗ NO sensitive data                 │
│                                     │
│ UID expires when:                   │
│ - User logs out                     │
│ - Browser closed                    │
│ - Session timeout (security)        │
│                                     │
│ LOGOUT clears:                      │
│ - localStorage.registeredUser       │
│ - sessionStorage                    │
│ - Firebase Auth session             │
└─────────────────────────────────────┘
```

---

## 📊 FLOWCHART 7: FILE ORGANIZATION

```
BOOKVAULT/
│
├─ public/                    ← Deployed to web server
│  │
│  ├─ index.html              ← Landing page
│  │
│  ├─ assets/
│  │  ├─ css/                 ← Stylesheets
│  │  │  ├─ landing.css
│  │  │  ├─ login.css
│  │  │  ├─ dashboard.css
│  │  │  └─ ... (other pages)
│  │  │
│  │  └─ js/                  ← JavaScript files
│  │     │
│  │     ├─ firebase/         ← Firebase integration
│  │     │  ├─ firebaseConfig.js    ← Credentials
│  │     │  ├─ firebaseInit.js      ← Setup
│  │     │  ├─ authService.js       ← Login/Register/Logout
│  │     │  ├─ userDataService.js   ← CRUD operations
│  │     │  ├─ authGuard.js         ← Protection
│  │     │  └─ logout.js            ← Logout handler
│  │     │
│  │     ├─ landing.js        ← Landing page logic
│  │     ├─ login.js          ← Login page logic
│  │     ├─ registration_*.js ← Registration flows
│  │     ├─ dashboard.js      ← Dashboard logic
│  │     ├─ clients.js        ← Client management
│  │     ├─ billing.js        ← Billing system
│  │     ├─ archive.js        ← Archive system
│  │     ├─ notifications.js  ← Notifications
│  │     └─ settings.js       ← Settings
│  │
│  └─ app/                   ← Application pages
│     ├─ login.html
│     ├─ dashboard.html
│     ├─ clients.html
│     ├─ client-detail.html
│     ├─ billing.html
│     ├─ archive.html
│     ├─ notifications.html
│     ├─ settings.html
│     ├─ help.html
│     └─ registration_*.html
│
├─ docs/                     ← Documentation
│  ├─ SETUP.md
│  ├─ STRUCTURE.md
│  ├─ FIREBASE-RULES.md
│  └─ API.md
│
├─ DEFENSE_SCRIPT.md         ← Full defense explanation
├─ DEFENSE_QUICK_REFERENCE.md ← Quick reference
├─ README.md
└─ .git/                     ← Git repository


DATA FLOW IN CODE:

User Click
   ↓
HTML (app/clients.html)
   ↓
JavaScript (js/clients.js)
   ↓
Firebase Service (js/firebase/userDataService.js)
   ↓
Firebase SDK (automatically bundled)
   ↓
Firebase Cloud Servers
   ↓
Firestore Database
   ↓
[Response back through same path]
   ↓
Update HTML/localStorage
   ↓
User sees result
```

---

## 🎬 KEY VISUAL SUMMARY

```
┌──────────────────────────────────────────────────────────┐
│              BOOKVAULT SYSTEM ARCHITECTURE               │
├──────────────────────────────────────────────────────────┤
│                                                          │
│   USER BROWSER                                           │
│   ┌──────────────────────────────────────────────┐      │
│   │ Landing Page / Login Page / App Pages        │      │
│   │ (HTML - what user sees)                      │      │
│   └──────────────────────────────────────────────┘      │
│                          ↕                              │
│   FRONTEND CODE (JavaScript)                           │
│   ┌──────────────────────────────────────────────┐      │
│   │ Page Logic: clients.js, billing.js, etc.     │      │
│   │ - Handle user clicks                         │      │
│   │ - Validate form data                         │      │
│   │ - Call services                              │      │
│   └──────────────────────────────────────────────┘      │
│                          ↕                              │
│   FIREBASE SERVICES (JavaScript SDK)                    │
│   ┌──────────────────────────────────────────────┐      │
│   │ authService.js                               │      │
│   │ - login()  - register()  - logout()           │      │
│   │                                               │      │
│   │ userDataService.js                           │      │
│   │ - addClient()   - getClients()                │      │
│   │ - updateClient() - deleteClient()             │      │
│   └──────────────────────────────────────────────┘      │
│                          ↓                              │
│   ════════════════════════════════════════════════     │
│            INTERNET (HTTPS - Encrypted)                │
│   ════════════════════════════════════════════════     │
│                          ↓                              │
│   FIREBASE CLOUD                                        │
│   ┌──────────────────────────────────────────────┐      │
│   │ Authentication Service                       │      │
│   │ - Verify email & password                    │      │
│   │ - Issue UID                                  │      │
│   │ - Manage sessions                            │      │
│   │                                               │      │
│   │ Firestore Database                           │      │
│   │ - Store user profiles                        │      │
│   │ - Store clients data                         │      │
│   │ - Store billing records                      │      │
│   │ - Real-time synchronization                  │      │
│   │                                               │      │
│   │ Security Rules                               │      │
│   │ - Verify user ownership                      │      │
│   │ - Validate data format                       │      │
│   └──────────────────────────────────────────────┘      │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

**Print these diagrams and bring sa defense!** 📋

Good luck! 🚀
