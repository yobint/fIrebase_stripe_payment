import * as functions from "firebase-functions";
import * as express from "express";
import {Stripe} from "stripe";
import * as path from "path";
// eslint-disable-next-line max-len
const stripeClient = new Stripe("sk_test_51OrP9nKHWP2CLGKZcfn2uVIQRk4nIgCOmNRH8RXkoQ1OtPjC6TDupb2yqBBl02F2YWIYpPyPnftahFXFuabMk4jR00QZgKSPj8");
const app = express();
app.use(express.static(path.join(__dirname, "public")));
const YOUR_DOMAIN = "http://localhost:4242";
app.post("/create-checkout-session", async (req, res) => {
  const session = await stripeClient.checkout.sessions.create({
    mode: "payment",
    success_url: `${YOUR_DOMAIN}/success.html`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "brl",
          product_data: {
            name: "Campaign",
          },
          unit_amount: 100,
        },
        quantity: 1,
      },
    ],
  });
  console.log("Checkout session URL:", session.url);
  if (session.url) {
    res.redirect(303, session.url);
  } else {
    res.status(500).send("Error creating checkout session");
  }
});

export const api = functions.https.onRequest(app);
app.listen(4242, () => {
  console.log("Running on port 4242");
});
