const functions = require('firebase-functions');
const admin = require('firebase-admin');
const stripe = require('stripe')(functions.config().stripe.secret);

admin.initializeApp();

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = functions.config().stripe.webhook_secret;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    const presskitsRef = admin.firestore().collection('presskits');

    // Handle checkout completion → activate Pro
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const artistSlug = session.client_reference_id;

        if (artistSlug) {
            try {
                const snapshot = await presskitsRef.where('slug', '==', artistSlug).limit(1).get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    await doc.ref.update({
                        isPro: true,
                        stripeCustomerId: session.customer || null,
                        stripeSubscriptionId: session.subscription || null,
                        proActivatedAt: new Date().toISOString(),
                    });
                    console.log(`Successfully upgraded artist ${artistSlug} to Pro.`);
                } else {
                    // Try direct doc ID lookup
                    const directDoc = await presskitsRef.doc(artistSlug).get();
                    if (directDoc.exists) {
                        await directDoc.ref.update({
                            isPro: true,
                            stripeCustomerId: session.customer || null,
                            stripeSubscriptionId: session.subscription || null,
                            proActivatedAt: new Date().toISOString(),
                        });
                        console.log(`Upgraded artist ${artistSlug} via direct lookup.`);
                    } else {
                        console.error(`No presskit found for slug: ${artistSlug}`);
                    }
                }
            } catch (error) {
                console.error('Error updating Firestore:', error);
            }
        }
    }

    // Handle subscription cancellation → deactivate Pro
    if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        if (customerId) {
            try {
                const snapshot = await presskitsRef
                    .where('stripeCustomerId', '==', customerId)
                    .limit(1)
                    .get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    await doc.ref.update({
                        isPro: false,
                        proCancelledAt: new Date().toISOString(),
                    });
                    console.log(`Deactivated Pro for customer ${customerId}.`);
                } else {
                    console.warn(`No presskit found for customer: ${customerId}`);
                }
            } catch (error) {
                console.error('Error deactivating Pro:', error);
            }
        }
    }

    res.json({ received: true });
});
