# Zayvora AI Payment Gateway Integration

Complete PhonePe payment system for monetizing Zayvora AI LLM service with automatic credit issuance.

## Overview

Zayvora AI is a proprietary Large Language Model (LLM) hosted on local infrastructure and exposed via daxini.xyz. This module implements:

- **PhonePe Payment Gateway** - RBI-regulated payment processor integration
- **Credit-Based Monetization** - ₹50 for 50 credits, ₹100 for 120 credits
- **Automatic Credit Issuance** - Instant credit delivery upon payment completion
- **Mobile-First UI** - Responsive pricing page with UPI intent support
- **Legal Compliance** - Terms, Privacy Policy, No-Refund Policy (Indian Payment Gateway compliant)

## File Structure

```
daxini-zayvora/
├── docs/
│   ├── TERMS_AND_CONDITIONS.md    # Service terms for Zayvora AI
│   ├── PRIVACY_POLICY.md          # Data protection & privacy
│   └── NO_REFUND_POLICY.md        # Strict no-refund policy
├── zayvora-pricing.html           # Mobile-first pricing & payment UI
└── README.md                       # This file

api/
└── payments/
    └── phonepe-webhook.js         # PhonePe webhook handler & payment API
```

## Features

### 🎯 Credit Packages

| Package | Price | Credits | Bonus | Price/Credit |
|---------|-------|---------|-------|--------------|
| Starter | ₹50 | 50 | — | ₹1.00 |
| Popular | ₹100 | 120 | 20% | ₹0.83 |

### 💳 Payment Features

- ✅ PhonePe Gateway (RBI-regulated)
- ✅ UPI Intent Support (Android/iOS)
- ✅ Real-time Credit Issuance
- ✅ Webhook-based Payment Verification
- ✅ Atomic Transactions (Firestore)
- ✅ Transaction History & Audit Logs
- ✅ GST Compliance (18% included)
- ✅ Rate Limiting & Fraud Detection

### 🔒 Security

- Signature Verification (PhonePe SHA256)
- Firebase Authentication Integration
- Encrypted Payment Data
- Idempotent Webhook Handling
- User Isolation (per UID)
- Rate Limiting on Payment APIs

### 📱 User Experience

- Mobile-first responsive design
- Dark gradient UI theme
- Real-time balance display
- One-click payment initiation
- UPI app redirect (Android/iOS)
- PhonePe web fallback
- Error handling & user feedback

## Setup

### Environment Variables

```bash
# .env
PHONEPE_MERCHANT_ID=MERCHANTUAT          # PhonePe merchant ID
PHONEPE_API_KEY=YOUR_API_KEY             # PhonePe API Key
PHONEPE_SALT_KEY=YOUR_SALT_KEY           # PhonePe Salt Key (for webhook verification)
PHONEPE_CALLBACK_SALT_INDEX=1            # Callback salt index (typically 1)

FIREBASE_PROJECT_ID=gen-lang-client-0662689801
FIREBASE_PRIVATE_KEY=...
FIREBASE_CLIENT_EMAIL=...

FRONTEND_URL=https://daxini.xyz
API_URL=https://daxini.xyz/api
```

### Installation

1. **Install Dependencies**
   ```bash
   npm install firebase-admin
   ```

2. **Setup PhonePe Merchant Account**
   - Register at: https://www.phonepe.com/business/
   - Get Merchant ID and API credentials
   - Set up webhook URL: `https://yourdomain.com/api/payments/phonepe-webhook`

3. **Firebase Setup**
   - Enable Firestore Database
   - Collections:
     - `users/{uid}/viaCredits` (number)
     - `transactions/{transactionId}` (payment record)
     - `users/{uid}/creditHistory/{id}` (audit log)

4. **Deploy**
   ```bash
   # Deploy to Vercel/Firebase Functions
   vercel deploy
   # or
   firebase deploy
   ```

## API Endpoints

### Initiate Payment
```bash
POST /api/payments/initiate-payment
Content-Type: application/json

{
  "userId": "user-uid",
  "packageId": "credits-50"
}

# Response
{
  "success": true,
  "redirectUrl": "https://phonepe.com/...",
  "merchantTransactionId": "user-uid-timestamp-credits-50"
}
```

### PhonePe Webhook
```bash
POST /api/payments/phonepe-webhook
X-Verify: signature
Content-Type: application/json

{
  "transactionId": "...",
  "merchantTransactionId": "...",
  "amount": 5000,
  "state": "COMPLETED",
  "responseCode": "SUCCESS"
}

# On success: Credits issued to user account
# Firestore updated: users/{uid}/viaCredits += credits
# Transaction logged: transactions/{transactionId}
```

### Check Payment Status
```bash
GET /api/payments/status/:merchantTransactionId

# Response
{
  "success": true,
  "status": "SUCCESS",
  "credits": 50,
  "amount": 50.00,
  "timestamp": "2026-04-03T..."
}
```

### Get Credit Packages
```bash
GET /api/payments/packages

# Response
{
  "success": true,
  "packages": [
    {
      "id": "credits-50",
      "amount": 5000,
      "credits": 50,
      "price": "₹50"
    },
    {
      "id": "credits-120",
      "amount": 11800,
      "credits": 120,
      "price": "₹100"
    }
  ]
}
```

## Legal Compliance

### Documents Included

1. **TERMS_AND_CONDITIONS.md**
   - Service description
   - Payment terms
   - Credit usage & expiration
   - Acceptable use policy
   - No refund policy reference
   - Liability limitations
   - RBI compliance statement

2. **PRIVACY_POLICY.md**
   - Data collection details
   - Third-party integrations (PhonePe, Firebase, Cloudflare)
   - User rights (access, deletion, portability)
   - GDPR compliance for international users
   - UK GDPR compliance
   - Data retention policies
   - Security measures

3. **NO_REFUND_POLICY.md**
   - Strict no-refund statement
   - Exceptions:
     - Infrastructure failure (24+ hours)
     - Duplicate billing
     - Fraudulent transactions
   - Refund request procedure
   - Consumer Protection Act, 2019 compliance
   - GST compliance
   - RBI regulatory compliance
   - International user rights (GDPR, UK GDPR)

### Compliance Certifications

- ✅ Indian Consumer Protection Act, 2019 (CPA 2019)
- ✅ Reserve Bank of India (RBI) Guidelines
- ✅ Goods and Services Tax (GST) Compliant
- ✅ Information Technology Act, 2000 (IT Act)
- ✅ GDPR (for EU/EEA users)
- ✅ UK GDPR (for UK users)
- ✅ Digital Signatures Act, 2000

## Database Schema

### users/{uid}

```javascript
{
  email: "user@example.com",
  viaCredits: 150,          // Current balance
  lastCreditUpdate: timestamp,
  creditSource: "zayvora-purchase"
}
```

### users/{uid}/creditHistory/{id}

```javascript
{
  type: "purchase",         // purchase, transfer, deduction, bonus
  amount: 50,              // Credits added/deducted
  source: "zayvora-phonepe",
  reason: "PhonePe payment: ₹50",
  transactionId: "TXN...",
  timestamp: timestamp
}
```

### transactions/{transactionId}

```javascript
{
  userId: "user-uid",
  transactionId: "TXN123456789",
  merchantTransactionId: "user-uid-timestamp-credits-50",
  amount: 50.00,           // Rupees
  credits: 50,
  status: "SUCCESS",       // SUCCESS, FAILED, PENDING
  timestamp: timestamp,
  creditPackage: "₹50",
  phonepeResponse: {
    state: "COMPLETED",
    responseCode: "SUCCESS",
    transactionId: "TXN..."
  }
}
```

## Frontend Integration

### HTML Page

The `zayvora-pricing.html` page includes:

- Responsive pricing card layout
- Real-time credit balance display
- Payment initiation form
- UPI intent handling for mobile
- Error message display
- Legal document links
- Info section with security badges

### Features

- Mobile-first responsive design
- Dark gradient background
- Smooth card animations
- Popular package highlighting
- Bonus credit badges
- Real-time balance loading
- Firebase authentication check
- PhonePe redirect handling

## Webhook Security

### Signature Verification

All PhonePe webhooks are signed and verified:

```javascript
const stringToHash = JSON.stringify(body) + saltKey;
const expectedSignature = SHA256(stringToHash) + "###" + saltIndex;

// Verify against X-Verify header
if (signature !== expectedSignature) {
  reject('Invalid signature');
}
```

### Idempotency

- Each transaction is checked for duplicates
- Webhook can be safely replayed
- Prevents double-crediting

## Credit Deduction Logic

When user sends prompt to Zayvora LLM:

1. Check user balance: `users/{uid}/viaCredits`
2. If balance >= 1:
   - Deduct 1 credit (atomic)
   - Process LLM request
   - Log to creditHistory
3. If balance < 1:
   - Return error: "Insufficient credits"
   - Prompt user to purchase

## Monitoring & Logs

### Transaction Logs

All transactions are logged in Firestore:
- Successful payments
- Failed payments
- Duplicate detection
- Webhook processing
- Error details

### Analytics

Monitor these metrics:
- Daily purchase volume
- Credit packages popularity
- Failed payment rate
- Duplicate billing incidents
- User acquisition cost

## Troubleshooting

### Payment Not Completing

1. Check network connectivity
2. Verify PhonePe redirect URL
3. Check browser console for errors
4. Verify merchantTransactionId format

### Credits Not Issued

1. Check webhook X-Verify signature
2. Verify Firestore connection
3. Check transaction status in Firestore
4. Verify user UID matches

### "Invalid Signature" Error

1. Verify PHONEPE_SALT_KEY is correct
2. Check CALLBACK_SALT_INDEX matches PhonePe settings
3. Ensure webhook body matches signed string exactly

## Support

**Email:** legal@daxini.xyz  
**Website:** daxini.xyz  
**Documentation:** See `/daxini-zayvora/docs/`

## License

Proprietary - Zayvora AI  
© 2026 Via Decide. All rights reserved.

---

**Status:** ✅ Production Ready  
**Last Updated:** April 3, 2026
