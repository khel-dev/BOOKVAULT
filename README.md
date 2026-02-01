# BookVault - Folder Structure

## Frontend
```
frontend/
├── css/          # Stylesheets
├── js/           # JavaScript
└── pages/        # HTML pages
```

## Backend
```
backend/
├── api/          # API endpoints
│   ├── auth/     # login.php, register.php
│   ├── clients.php
│   └── billing.php
├── config/       # database.php
├── includes/     # db.php
└── database/     # schema.sql
```

## How to Run (XAMPP)
1. Copy BOOKVAULT to `C:\xampp\htdocs\`
2. Start Apache + MySQL
3. Import `backend/database/schema.sql` in phpMyAdmin
4. Open: http://localhost/BOOKVAULT/

## Entry Point
- http://localhost/BOOKVAULT/ → redirects to login

## API Endpoints (for frontend wiring)
- POST `backend/api/auth/register.php` - Register
- POST `backend/api/auth/login.php` - Login
- GET/POST/PUT/DELETE `backend/api/clients.php` - Clients
- GET/POST/DELETE `backend/api/billing.php` - Billing statements
