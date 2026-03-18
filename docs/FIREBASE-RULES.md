# 🔐 Firestore Security Rules

These rules ensure users can only access their own data.

## Current Rules (Apply these in Firebase Console)

Go to **Firebase Console → Firestore → Rules** and paste:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - each user can only access their own document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Subcollections - inherit parent permissions
      match /{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }
    
  }
}
```

## What These Rules Do

✅ **Allow**
- Users can read/write their own user document
- Users can read/write their own subcollections (clients, billing, notifications, etc.)
- Example: User `abc123` can only access `/users/abc123/`

❌ **Block**
- Users cannot access other users' data
- Unauthenticated users cannot access any data
- Users cannot create data outside `/users/{userId}/` paths

## Testing Rules

In Firebase Console → Firestore → Rules tab:

1. Click **Rules Playground**
2. Test reading `/users/{anyUserId}/` with different auth users
3. Verify access is denied for other users' data

## Rule Explanation

```
match /users/{userId} {
  // {userId} is a wildcard variable capturing the document ID
  
  allow read, write: if request.auth.uid == userId;
  // Allow read/write ONLY if the logged-in user's UID matches the document ID
  
  match /{document=**} {
    // ** means all nested documents/collections
    // Applies the same rule to all subcollections
  }
}
```

## Advanced Rules (Optional Future)

For more specific control:

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Specific subcollection rules
      match /clients/{clientId} {
        allow read, write: if request.auth.uid == userId;
        allow delete: if request.auth.uid == userId && request.resource.data.status != 'archived';
      }
      
      match /settings/preferences {
        allow read, write: if request.auth.uid == userId;
      }
    }
  }
}
```

## Deployment

1. Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Firestore
2. Go to **RULES** tab
3. Paste the rules above
4. Click **PUBLISH**

Done! 🎉
