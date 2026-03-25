# firebase.md — VIA Firebase Rules & Patterns

## Scope
Repo: VIA (viadecide.com)
Role: Firebase runs ALONGSIDE Supabase. They are not interchangeable.
Vanilla HTML/JS/CSS. No build step. All Firebase via CDN imports.

---

## Service Split — Who Owns What

| Concern | Owner | Never Cross |
|---|---|---|
| User Auth (primary) | Supabase | Don't duplicate auth in Firebase |
| Social feed posts | Supabase (Postgres) | — |
| File uploads (media, avatars) | Firebase Storage | Not Supabase Storage |
| Realtime presence / live counters | Firebase Realtime DB | Not Supabase Realtime |
| User-generated content metadata | Firestore | Heavy queries stay in Supabase |
| Media CDN delivery | Firebase Storage CDN | — |
| Serverless functions (heavy ops) | Cloud Functions | Not in-browser logic |
| Static asset hosting (fallback) | Firebase Hosting | Primary is Vercel |

---

## SDK Init — CDN Pattern (no build step)

```html
<!-- In <head> — load once, never reinitialize -->
<script type="module">
  import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
  import { getStorage } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';
  import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';
  import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';
  import { getFunctions } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

  const firebaseConfig = {
    apiKey: window.VIA_FIREBASE_API_KEY,        // injected at runtime, never hardcoded
    authDomain: "viadecide.firebaseapp.com",
    databaseURL: "https://viadecide-default-rtdb.firebaseio.com",
    projectId: "viadecide",
    storageBucket: "viadecide.appspot.com",
    messagingSenderId: window.VIA_FIREBASE_SENDER_ID,
    appId: window.VIA_FIREBASE_APP_ID
  };

  // Guard: never init twice
  if (!window._firebaseApp) {
    window._firebaseApp = initializeApp(firebaseConfig);
    window._storage  = getStorage(window._firebaseApp);
    window._firestoreDB = getFirestore(window._firebaseApp);
    window._rtdb     = getDatabase(window._firebaseApp);
    window._functions = getFunctions(window._firebaseApp, 'asia-south1'); // Mumbai region
  }
</script>
```

---

## Firebase Storage — File Uploads

### Upload Pattern
```js
import { ref, uploadBytesResumable, getDownloadURL } from
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js';

async function uploadMedia(file, userId, type = 'avatar') {
  // type: 'avatar' | 'post-media' | 'story-asset'
  const ext = file.name.split('.').pop();
  const path = `${type}/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(window._storage, path);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file);

    task.on('state_changed',
      (snap) => {
        const pct = (snap.bytesTransferred / snap.totalBytes) * 100;
        updateUploadProgress(pct); // update your progress UI
      },
      (err) => reject(err),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}
```

### Storage Paths Convention
```
avatars/{userId}/avatar.{ext}
post-media/{postId}/{filename}
story-assets/{storyId}/{filename}
tool-assets/public/{filename}
```

### Storage Security Rules
```js
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Avatars: owner read/write, public read
    match /avatars/{userId}/{file} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 2 * 1024 * 1024  // 2MB max
                   && request.resource.contentType.matches('image/.*');
    }
    // Post media: auth write, public read
    match /post-media/{postId}/{file} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.resource.size < 10 * 1024 * 1024; // 10MB max
    }
    // Tool assets: read-only for all
    match /tool-assets/public/{file} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## Firestore — Metadata & Structured Content

### When to Use Firestore vs Supabase
- Use Firestore for: denormalized read-heavy data, user preferences, notification payloads, tool usage logs
- Use Supabase for: relational joins, feed posts, auth-linked records, heavy queries

### Firestore Collection Structure
```
/users/{userId}
  - displayName, avatarUrl, xp, level, bio
  - createdAt, lastSeen

/posts/{postId}
  - title, sections[], authorId, tags[]
  - mediaUrls[], createdAt, viewCount

/reactions/{postId}/counts
  - likes, saves, shares (aggregated — not per-user)

/tools/{toolId}
  - name, category, description, launchCount
  - lastUsed

/notifications/{userId}/items/{notifId}
  - type, message, read, createdAt
```

### Firestore Read Pattern (with timeout)
```js
import { doc, getDoc, collection, getDocs, query, where, limit }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

async function getDocSafe(path, fallback = null, timeoutMs = 4000) {
  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error('firestore-timeout')), timeoutMs)
  );
  try {
    const snap = await Promise.race([
      getDoc(doc(window._firestoreDB, path)),
      timeout
    ]);
    return snap.exists() ? snap.data() : fallback;
  } catch {
    return fallback;
  }
}
```

### Firestore Security Rules
```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    // Users: public read, owner write
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    // Posts: public read, auth write
    match /posts/{postId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.authorId;
    }
    // Notifications: owner only
    match /notifications/{userId}/items/{notifId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Tools: public read, no client write
    match /tools/{toolId} {
      allow read: if true;
      allow write: if false; // Cloud Functions only
    }
  }
}
```

---

## Realtime Database — Live Presence & Counters

### Use Cases in VIA
- Online user count (live feed indicator)
- Post view count (increment without full DB write)
- "X people reading this" on a swipe card
- Feed heartbeat / activity pulse

### Presence Pattern
```js
import { ref, onValue, onDisconnect, set, serverTimestamp }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

function initPresence(userId) {
  const presenceRef = ref(window._rtdb, `presence/${userId}`);
  const connectedRef = ref(window._rtdb, '.info/connected');

  onValue(connectedRef, (snap) => {
    if (snap.val() === true) {
      // Write presence on connect
      set(presenceRef, { online: true, lastSeen: serverTimestamp() });
      // Remove on disconnect
      onDisconnect(presenceRef).set({ online: false, lastSeen: serverTimestamp() });
    }
  });
}
```

### Live Counter Pattern
```js
import { ref, runTransaction }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js';

async function incrementViewCount(postId) {
  const counterRef = ref(window._rtdb, `counters/posts/${postId}/views`);
  await runTransaction(counterRef, (current) => (current || 0) + 1);
}
```

### RTDB Structure
```
/presence/{userId}
  - online: bool
  - lastSeen: timestamp

/counters/posts/{postId}
  - views: number
  - activeReaders: number

/feed/pulse
  - activeUsers: number   // global live count
```

### RTDB Security Rules
```json
{
  "rules": {
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == $userId"
      }
    },
    "counters": {
      ".read": true,
      ".write": "auth != null"
    },
    "feed": {
      "pulse": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

---

## Cloud Functions — Serverless Ops

### Region
Always deploy to `asia-south1` (Mumbai). Lowest latency for Bharat users.

```js
// functions/index.js
const { onRequest } = require('firebase-functions/v2/https');
const { setGlobalOptions } = require('firebase-functions/v2');

setGlobalOptions({ region: 'asia-south1' });
```

### Use Cases in VIA
```
onUserCreate     → seed Firestore /users doc + set default XP
onPostCreate     → generate story sections via Gemini, push to Firestore
onReaction       → update denormalized reaction counts in RTDB
onFileUpload     → resize/compress avatar images via Sharp
sendNotification → trigger FCM push on reply/reaction
purgeStaleData   → scheduled: delete posts > 90 days old
```

### Callable Function Pattern (from frontend)
```js
import { httpsCallable }
  from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-functions.js';

async function callFunction(name, payload) {
  try {
    const fn = httpsCallable(window._functions, name);
    const result = await fn(payload);
    return result.data;
  } catch (err) {
    console.error(`Cloud Function ${name} failed:`, err.message);
    return null;
  }
}

// Usage
const story = await callFunction('generateStory', { topic: 'IPL Economy' });
```

---

## Firebase Hosting — Fallback Config

Firebase Hosting is secondary to Vercel. Used for:
- CDN edge caching of static assets
- Fallback if Vercel has an outage
- Hosting Cloud Function endpoints under viadecide.com/api/*

### firebase.json
```json
{
  "hosting": {
    "public": ".",
    "ignore": [".claude/**", ".git/**", "functions/**", "node_modules/**"],
    "rewrites": [
      { "source": "/api/**", "function": "api" },
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|html)",
        "headers": [{ "key": "Cache-Control", "value": "max-age=3600" }]
      }
    ]
  }
}
```

---

## Auth Bridge — Firebase + Supabase Together

Firebase Auth is NOT the primary auth. Supabase handles login/session.
Firebase services that require `request.auth` use a **custom token bridge**.

### Bridge Pattern
```js
// After Supabase auth resolves, mint a Firebase custom token via Cloud Function
async function bridgeAuth(supabaseUserId) {
  if (window._firebaseAuthBridged) return; // only once per session
  const token = await callFunction('mintFirebaseToken', { uid: supabaseUserId });
  if (token) {
    const { signInWithCustomToken } = await import(
      'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js'
    );
    const auth = getAuth(window._firebaseApp);
    await signInWithCustomToken(auth, token);
    window._firebaseAuthBridged = true;
  }
}

// Call this after Supabase onAuthStateChange confirms a user
_supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    bridgeAuth(session.user.id);
    renderAuthedState(session.user);
  } else {
    window._firebaseAuthBridged = false;
    renderGuestState();
  }
});
```

---

## Hard Rules

- NEVER hardcode Firebase API keys in source files — use `window.VIA_FIREBASE_*` injected via Vercel env vars
- NEVER init Firebase more than once — guard with `window._firebaseApp` check
- NEVER use Firebase Auth as primary auth — Supabase owns auth, Firebase gets a bridged token
- ALWAYS use `asia-south1` region for Cloud Functions
- ALWAYS add progress UI for Storage uploads — never a silent async call
- ALWAYS timeout Firestore reads at 4s with a fallback value
- ALWAYS unsubscribe RTDB listeners when the user navigates away from a tab
- Storage upload size limits: avatars 2MB, post media 10MB, enforce in rules AND in UI
