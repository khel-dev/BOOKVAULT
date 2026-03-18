# 📖 Firebase Services API Reference

All services are globally available as `window.authService` and `window.userDataService`.

## AuthService

Handles user authentication with Firebase Auth.

### Methods

#### `register(email, password, userData)`
**Creates a new user account and stores profile in Firestore**

```javascript
const result = await authService.register(
  'user@example.com',
  'password123',
  {
    firstName: 'John',
    lastName: 'Doe',
    businessName: 'My Business',
    gender: 'male',
    certification: 'cpa'
  }
);

// Returns:
{
  success: true,
  user: {uid, email, ...},
  uid: 'abc123'
}
```

**Parameters:**
- `email` (string, required) - User's email
- `password` (string, required) - Minimum 6 characters
- `userData` (object) - Additional profile fields

**Errors:**
- `auth/email-already-in-use` - Email already registered
- `auth/invalid-email` - Invalid email format
- `auth/weak-password` - Password < 6 characters

---

#### `login(email, password)`
**Authenticates existing user**

```javascript
const result = await authService.login(
  'user@example.com',
  'password123'
);

// Returns:
{
  success: true,
  user: {uid, email, ...},
  uid: 'abc123'
}
```

**Errors:**
- `auth/user-not-found` - Email not registered
- `auth/wrong-password` - Incorrect password
- `auth/too-many-requests` - Too many failed attempts

---

#### `logout()`
**Signs out current user**

```javascript
await authService.logout();
// Returns: { success: true }
```

---

#### `getCurrentUser()`
**Returns current Firebase user object**

```javascript
const user = authService.getCurrentUser();
// Returns: {uid, email, displayName, ...} or null
```

---

#### `getCurrentUserId()`
**Returns current user's UID (shortcut)**

```javascript
const uid = authService.getCurrentUserId();
// Returns: 'abc123' or null
```

---

#### `isLoggedIn()`
**Checks if user is authenticated**

```javascript
if (authService.isLoggedIn()) {
  console.log('User is logged in');
}
// Returns: true or false
```

---

#### `getUserProfile(userId)`
**Fetches user profile from Firestore**

```javascript
const profile = await authService.getUserProfile('abc123');
// Returns: {email, firstName, lastName, businessName, ...}
```

---

#### `updateUserProfile(userId, updates)`
**Updates user profile in Firestore**

```javascript
await authService.updateUserProfile('abc123', {
  businessName: 'New Business Name',
  phone: '555-1234'
});
```

---

#### `resetPassword(email)`
**Sends password reset email**

```javascript
await authService.resetPassword('user@example.com');
// Returns: { success: true }
```

---

### Event Listeners

FirebaseAuth dispatches custom events:

```javascript
// User logs in
window.addEventListener('userLoggedIn', (event) => {
  console.log('User:', event.detail);
});

// User logs out
window.addEventListener('userLoggedOut', (event) => {
  console.log('User logged out');
});
```

---

## UserDataService

Manages all user data in Firestore (clients, billing, notifications, etc.).

### Clients

#### `addClient(userId, clientData)`
**Creates new client entry**

```javascript
const clientId = await userDataService.addClient('abc123', {
  name: 'Acme Corp',
  email: 'contact@acme.com',
  phone: '555-1234',
  address: '123 Main St'
});
// Returns: 'clientId'
```

#### `getClients(userId)`
**Fetches all clients for user**

```javascript
const clients = await userDataService.getClients('abc123');
// Returns: [{id, name, email, ...}, ...]
```

#### `getClient(userId, clientId)`
**Fetches single client**

```javascript
const client = await userDataService.getClient('abc123', 'client456');
// Returns: {id, name, email, ...}
```

#### `updateClient(userId, clientId, updates)`
**Updates client data**

```javascript
await userDataService.updateClient('abc123', 'client456', {
  name: 'New Name',
  email: 'newemail@example.com'
});
```

#### `deleteClient(userId, clientId)`
**Deletes client**

```javascript
await userDataService.deleteClient('abc123', 'client456');
```

---

### Billing Records

#### `addBillingRecord(userId, billingData)`
**Creates billing record**

```javascript
const billingId = await userDataService.addBillingRecord('abc123', {
  clientId: 'client456',
  amount: 1500,
  status: 'pending',
  dueDate: new Date('2026-04-18'),
  description: 'Monthly bookkeeping'
});
```

#### `getBillingRecords(userId)`
**Fetches all billing records**

```javascript
const records = await userDataService.getBillingRecords('abc123');
// Returns: [{id, amount, status, dueDate, ...}, ...]
```

---

### Notifications

#### `addNotification(userId, notificationData)`
**Creates notification**

```javascript
const notifId = await userDataService.addNotification('abc123', {
  message: 'Payment received from ACME Corp',
  type: 'info'
});
```

#### `getNotifications(userId)`
**Fetches all notifications**

```javascript
const notifs = await userDataService.getNotifications('abc123');
// Returns: [{id, message, read, createdAt, ...}, ...]
```

#### `markNotificationRead(userId, notificationId)`
**Marks notification as read**

```javascript
await userDataService.markNotificationRead('abc123', 'notif789');
```

---

### Settings

#### `updateSettings(userId, settingsData)`
**Updates user settings**

```javascript
await userDataService.updateSettings('abc123', {
  theme: 'dark',
  notifications: true,
  currency: 'USD'
});
```

#### `getSettings(userId)`
**Fetches user settings**

```javascript
const settings = await userDataService.getSettings('abc123');
// Returns: {theme, notifications, currency, ...}
```

---

### Archives

#### `addArchive(userId, archiveData)`
**Creates archive entry**

```javascript
const archiveId = await userDataService.addArchive('abc123', {
  title: 'Q1 2026 Records',
  description: 'Quarterly financial records',
  tags: ['quarterly', '2026']
});
```

#### `getArchives(userId)`
**Fetches archives**

```javascript
const archives = await userDataService.getArchives('abc123');
// Returns: [{id, title, description, ...}, ...]
```

---

## Error Handling

All methods throw errors with this structure:

```javascript
try {
  await authService.login(email, password);
} catch (error) {
  console.log(error.code);       // 'auth/user-not-found'
  console.log(error.message);    // User-friendly message
}
```

**Common Error Codes:**
- `auth/email-already-in-use`
- `auth/invalid-email`
- `auth/weak-password`
- `auth/user-not-found`
- `auth/wrong-password`
- `auth/too-many-requests`
- `auth/operation-not-allowed`

---

## Usage Examples

### Complete Registration Flow
```javascript
try {
  const result = await authService.register(
    'john@example.com',
    'SecurePass123',
    {
      firstName: 'John',
      lastName: 'Doe',
      businessName: 'John Bookkeeping',
      gender: 'male'
    }
  );
  console.log('Account created:', result.uid);
} catch (error) {
  console.error('Registration failed:', error.message);
}
```

### Add Client and Send Notification
```javascript
const userId = authService.getCurrentUserId();

const clientId = await userDataService.addClient(userId, {
  name: 'New Client Inc',
  email: 'client@example.com'
});

await userDataService.addNotification(userId, {
  message: `New client added: New Client Inc`,
  type: 'success'
});
```

### Fetch All User Data
```javascript
const userId = authService.getCurrentUserId();

const [clients, billing, notifications] = await Promise.all([
  userDataService.getClients(userId),
  userDataService.getBillingRecords(userId),
  userDataService.getNotifications(userId)
]);

console.log('Clients:', clients);
console.log('Billing:', billing);
console.log('Notifications:', notifications);
```

### Monitor Auth State
```javascript
window.addEventListener('userLoggedIn', (event) => {
  const user = event.detail;
  console.log(`Welcome ${user.email}!`);
  // Load dashboard
});

window.addEventListener('userLoggedOut', () => {
  console.log('Goodbye!');
  // Redirect to login
});
```

---

## Performance Tips

1. **Use Promise.all() for multiple queries**
   ```javascript
   const [clients, billing] = await Promise.all([
     userDataService.getClients(uid),
     userDataService.getBillingRecords(uid)
   ]);
   ```

2. **Cache frequently accessed data**
   ```javascript
   sessionStorage.setItem('userSettings', JSON.stringify(settings));
   ```

3. **Add `.orderBy()` to queries** (return to Firestore as needed)

---

For more details on specific functions, see the service source code in `public/assets/js/firebase/`.
