/**
 * PhonePe Payment Gateway Webhook Handler
 * Handles payment verification, credit issuance, and transaction logging
 */

const crypto = require('crypto');
const admin = require('firebase-admin');
const db = admin.firestore();

// PhonePe Configuration (from environment variables)
const MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'MERCHANTUAT';
const API_KEY = process.env.PHONEPE_API_KEY;
const CALLBACK_SALT_INDEX = 1; // PhonePe callback salt index

/**
 * Verify PhonePe Callback Signature
 * @param {Object} body - Request body
 * @param {string} signature - X-Verify header
 * @returns {boolean} - True if signature is valid
 */
function verifyPhonePeSignature(body, signature, saltKey) {
  const baseString = JSON.stringify(body) + saltKey;
  const expectedSignature = crypto
    .createHash('sha256')
    .update(baseString)
    .digest('hex');

  return signature === expectedSignature + '###' + CALLBACK_SALT_INDEX;
}

/**
 * Credit packages configuration
 */
const CREDIT_PACKAGES = {
  'credits-50': { amount: 5000, credits: 50, price: '₹50' },
  'credits-120': { amount: 11800, credits: 120, price: '₹100' }
};

/**
 * PhonePe Webhook Handler
 * POST /api/payments/phonepe-webhook
 */
exports.handlePhonePeWebhook = async (req, res) => {
  try {
    const { body } = req;
    const signature = req.headers['x-verify'];
    const saltKey = process.env.PHONEPE_SALT_KEY;

    // Verify signature
    if (!verifyPhonePeSignature(body, signature, saltKey)) {
      console.error('Invalid PhonePe signature');
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const {
      transactionId,
      merchantTransactionId,
      amount,
      state,
      responseCode,
      data
    } = body;

    // Log transaction
    console.log(`PhonePe Webhook: TXN=${transactionId}, Status=${state}, Amount=${amount}`);

    // Extract user ID from merchantTransactionId (format: user-uid-timestamp)
    const [, userId] = merchantTransactionId.split('-');

    if (!userId) {
      console.error('Invalid merchantTransactionId format');
      return res.status(400).json({ success: false, message: 'Invalid transaction ID' });
    }

    // Check if transaction already processed
    const txnRef = db.collection('transactions').doc(transactionId);
    const existingTxn = await txnRef.get();

    if (existingTxn.exists) {
      console.log(`Transaction ${transactionId} already processed`);
      return res.status(200).json({ success: true, message: 'Transaction already processed' });
    }

    if (state === 'COMPLETED' && responseCode === 'SUCCESS') {
      // Payment successful - issue credits
      const creditData = CREDIT_PACKAGES[merchantTransactionId.split('-')[2]];

      if (!creditData) {
        console.error('Invalid credit package in transaction');
        return res.status(400).json({ success: false, message: 'Invalid credit package' });
      }

      // Atomic transaction: add credits and log
      await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists) {
          throw new Error('User not found');
        }

        // Increment credit balance
        const currentBalance = userDoc.data().viaCredits || 0;
        const newBalance = currentBalance + creditData.credits;

        transaction.update(userRef, {
          viaCredits: newBalance,
          lastCreditUpdate: new Date(),
          creditSource: 'zayvora-purchase'
        });

        // Log transaction
        transaction.set(txnRef, {
          userId,
          transactionId,
          merchantTransactionId,
          amount: amount / 100, // Convert from paise to rupees
          credits: creditData.credits,
          status: 'SUCCESS',
          timestamp: new Date(),
          creditPackage: creditData.price,
          phonepeResponse: {
            state,
            responseCode,
            transactionId
          }
        });

        // Log to credit history
        transaction.set(
          db.collection('users').doc(userId).collection('creditHistory').doc(),
          {
            type: 'purchase',
            amount: creditData.credits,
            source: 'zayvora-phonepe',
            reason: `PhonePe payment: ${creditData.price}`,
            transactionId,
            timestamp: new Date()
          }
        );
      });

      console.log(`Credits issued: ${creditData.credits} to user ${userId}`);
      return res.status(200).json({
        success: true,
        message: 'Credits issued successfully',
        credits: creditData.credits
      });

    } else if (state === 'FAILED' || responseCode === 'FAILURE') {
      // Payment failed - log failure
      await txnRef.set({
        userId,
        transactionId,
        merchantTransactionId,
        amount: amount / 100,
        status: 'FAILED',
        timestamp: new Date(),
        phonepeResponse: {
          state,
          responseCode,
          transactionId
        }
      });

      console.log(`Payment failed for transaction ${transactionId}`);
      return res.status(200).json({
        success: false,
        message: 'Payment failed',
        status: state
      });

    } else {
      // Pending or other state - log as pending
      await txnRef.set({
        userId,
        transactionId,
        merchantTransactionId,
        amount: amount / 100,
        status: 'PENDING',
        timestamp: new Date(),
        phonepeResponse: {
          state,
          responseCode,
          transactionId
        }
      });

      return res.status(200).json({
        success: true,
        message: 'Transaction recorded as pending'
      });
    }

  } catch (error) {
    console.error('PhonePe webhook error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Initiate PhonePe Payment
 * POST /api/payments/initiate-payment
 * Body: { userId, packageId }
 */
exports.initiatePhonePePayment = async (req, res) => {
  try {
    const { userId, packageId } = req.body;

    if (!userId || !packageId || !CREDIT_PACKAGES[packageId]) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid userId or packageId'
      });
    }

    const creditData = CREDIT_PACKAGES[packageId];
    const timestamp = Date.now();
    const merchantTransactionId = `${userId}-${timestamp}-${packageId}`;

    // Prepare PhonePe API request
    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId,
      merchantUserId: userId,
      amount: creditData.amount, // in paise
      redirectUrl: `${process.env.FRONTEND_URL}/payment-status?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl: `${process.env.API_URL}/api/payments/phonepe-webhook`,
      mobileNumber: '', // User's phone (can be collected in UI)
      paymentInstrument: {
        type: 'UPI'
      }
    };

    // Generate signature
    const stringToHash = `/pg/v1/pay${JSON.stringify(payload)}${API_KEY}`;
    const signature = crypto
      .createHash('sha256')
      .update(stringToHash)
      .digest('hex') + '###' + CALLBACK_SALT_INDEX;

    // Call PhonePe API
    const response = await fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Verify': signature
      },
      body: JSON.stringify(payload)
    });

    const phonepeResponse = await response.json();

    if (phonepeResponse.success) {
      return res.status(200).json({
        success: true,
        redirectUrl: phonepeResponse.data.instrumentResponse.redirectUrl,
        merchantTransactionId
      });
    } else {
      console.error('PhonePe API error:', phonepeResponse);
      return res.status(400).json({
        success: false,
        message: 'Failed to initiate payment',
        error: phonepeResponse.message
      });
    }

  } catch (error) {
    console.error('Payment initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Check Payment Status
 * GET /api/payments/status/:merchantTransactionId
 */
exports.checkPaymentStatus = async (req, res) => {
  try {
    const { merchantTransactionId } = req.params;

    // Query Firestore for transaction
    const txnSnapshot = await db.collection('transactions')
      .where('merchantTransactionId', '==', merchantTransactionId)
      .limit(1)
      .get();

    if (txnSnapshot.empty) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    const txn = txnSnapshot.docs[0].data();

    return res.status(200).json({
      success: true,
      status: txn.status,
      credits: txn.credits || 0,
      amount: txn.amount,
      timestamp: txn.timestamp
    });

  } catch (error) {
    console.error('Status check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get Credit Packages
 * GET /api/payments/packages
 */
exports.getCreditPackages = (req, res) => {
  const packages = Object.entries(CREDIT_PACKAGES).map(([id, data]) => ({
    id,
    ...data
  }));

  return res.status(200).json({
    success: true,
    packages
  });
};
