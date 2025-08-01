import stripe from "stripe";
import Booking from '../models/Booking.js'
import { inngest } from "../inngest/index.js";

// export const stripeWebhooks = async (request, response) => {
//   const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
//   const sig = request.headers["stripe-signature"];

//   let event;

//   try {
//     event = stripeInstance.webhooks.constructEvent(
//       request.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (error) {
//     return response.status(400).send(`Webhook Error: ${error.message}`);
//   }

//   try {
//     switch (event.type) {
//       case "payment_intent.succeeded": {
//         const paymentIntent = event.data.object;
//         const sessionList = await stripeInstance.checkout.sessions.list({
//           payment_intent: paymentIntent.id
//         });

//         const session = sessionList.data[0];
//         const { bookingId } = session.metadata;

//         await Booking.findByIdAndUpdate(bookingId, {
//           isPaid: true,
//           paymentLink: ""
//         });
//         console.log("Triggering inngest with bookingId:", bookingId);
//         //send confirmation Email
//         await inngest.send({
//         name: 'app/show.booked',
//         data: { bookingId }
//       });

//         break;
//       }

//       default:
//         console.log("Unhandled event type:", event.type);
//     }
//     response.json({ received: true });
//   } catch (error) {
//     console.error("Webhook processing error: ", error);
//     response.status(500).send("Internal Server Error");
//   }
// };

export const stripeWebhooks = async (request, response) => {
  console.log("Stripe webhook called");

  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];
  console.log("Stripe signature:", sig);

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log("Stripe event constructed:", event.type);
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        console.log("Payment intent succeeded event received");
        const paymentIntent = event.data.object;
        console.log("Payment intent ID:", paymentIntent.id);

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id
        });

        console.log("Session list:", sessionList.data);

        const session = sessionList.data[0];
        if (!session) {
          console.error("No session found for payment intent");
          break;
        }

        const { bookingId } = session.metadata || {};
        console.log("Booking ID from session metadata:", bookingId);

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: ""
        });
        console.log("Booking updated, triggering inngest");

        await inngest.send({
          name: 'app/show.booked',
          data: { bookingId }
        });
        console.log("Inngest event sent");

        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }
    response.json({ received: true });
  } catch (error) {
    console.error("Webhook processing error: ", error);
    response.status(500).send("Internal Server Error");
  }
};
