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

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        // We expect the client_reference_id to be something we can use to identify the user
        // For this MVP, we might be using the slug, or if we had Auth, the UID.
        // Let's assume we passed the Artist Slug or ID in client_reference_id
        const artistSlug = session.client_reference_id;

        if (artistSlug) {
            try {
                // Query Firestore to find the document with this slug
                const presskitsRef = admin.firestore().collection('presskits');
                const snapshot = await presskitsRef.where('slug', '==', artistSlug).limit(1).get();

                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    await doc.ref.update({ isPro: true });
                    console.log(`Successfully upgraded artist ${artistSlug} to Pro.`);
                } else {
                    console.error(`No presskit found for slug: ${artistSlug}`);
                }
            } catch (error) {
                console.error('Error updating Firestore:', error);
            }
        }
    }

    res.json({ received: true });
});
