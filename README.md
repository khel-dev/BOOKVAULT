# BookKeeper

BookKeeper is a static bookkeeping web application for bookkeepers and MSMEs. It helps users manage clients, billing statements, archived records, notifications, and account settings through a browser-based dashboard.

The project was originally named BookVault in some files/assets, but the current app branding and page titles use BookKeeper.

## What This Project Is

BookKeeper is a frontend-first bookkeeping management system built with HTML, CSS, and vanilla JavaScript. Firebase provides the backend services for authentication, Firestore database storage, and hosting.

No PHP backend is required in the current version.

## Main Features

- Landing page for the BookKeeper app
- Email/password login with Firebase Authentication
- Multi-step account registration
- Dashboard with bookkeeping overview
- Client management
- Client detail view
- Billing statement management
- Archive page for stored records
- Notifications page
- Settings page
- Help and support page
- Firebase debug pages for checking setup status

## Tech Stack

| Area | Technology |
| --- | --- |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Authentication | Firebase Authentication |
| Database | Cloud Firestore |
| Hosting | Firebase Hosting |
| Charts | Chart.js |
| Icons | Font Awesome |
| Main app folder | `public/` |

## Project Structure

```text
BOOKVAULT/
|-- index.html                  # Root redirect to public/index.html
|-- 404.html                    # Firebase Hosting fallback page
|-- firebase.json               # Firebase Hosting config
|-- .firebaserc                 # Firebase project alias
|-- public/
|   |-- index.html              # Landing page
|   |-- debug.html              # Firebase debug page
|   |-- debug-simple.html       # Simple debug page
|   |-- app/                    # App screens
|   |-- assets/
|       |-- css/                # Page styles
|       |-- js/                 # Page scripts and Firebase services
|       |-- img/                # Logos and images
|-- docs/                       # Setup, API, and Firebase notes
```

## App Pages

| Page | Route |
| --- | --- |
| Landing | `/public/index.html` |
| Login | `/public/app/login.html` |
| Registration - Personal | `/public/app/registration_personal.html` |
| Registration - Business | `/public/app/registration_business.html` |
| Registration - Account | `/public/app/registration_account.html` |
| Dashboard | `/public/app/dashboard.html` |
| Clients | `/public/app/clients.html` |
| Client Detail | `/public/app/client-detail.html` |
| Billing | `/public/app/billing.html` |
| Archive | `/public/app/archive.html` |
| Notifications | `/public/app/notifications.html` |
| Settings | `/public/app/settings.html` |
| Help | `/public/app/help.html` |
| Firebase Debug | `/public/debug.html` |

The root `index.html` redirects visitors to `public/index.html`.

## Firebase Setup

Firebase configuration is stored in:

```text
public/assets/js/firebase/firebaseConfig.js
```

The Firebase project alias is stored in:

```text
.firebaserc
```

Required Firebase services:

- Firebase Authentication with Email/Password sign-in enabled
- Cloud Firestore
- Firebase Hosting

Related documentation:

```text
docs/SETUP.md
docs/FIREBASE-RULES.md
docs/API.md
docs/STRUCTURE.md
```

## Data Model

The app stores user-owned bookkeeping data under each authenticated user in Firestore.

```text
users/
|-- {uid}/
|   |-- clients/
|   |-- billing/
|   |-- archives/
|   |-- notifications/
|   |-- settings/
```

## Run Locally

Because this is a static app, it can be served with any simple local server.

Using Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/public/index.html
```

## Deploy to Firebase Hosting

Install Firebase CLI if needed:

```bash
npm install -g firebase-tools
```

Login:

```bash
firebase login
```

Deploy:

```bash
firebase deploy
```

The current `firebase.json` deploys from the repository root, where `index.html` redirects into the `public/` app.

## Notes

- The current version is not PHP-based.
- Firebase handles authentication, database, and hosting.
- The app uses page-specific JavaScript files in `public/assets/js/`.
- Some asset and service names still use the older BookVault name.

## License

Private project. All rights reserved.
