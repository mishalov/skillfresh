import { addDays } from "date-fns";
import { stripeApi } from "../../../services/StripeApi";
import {
  buildBankPaymentDetailsUrl,
  buildCancelUrl,
  buildSuccessUrl,
} from "../../../utils/buildRoutes";

export default {
  async start({ order }) {
    const { email, paymentPlan } = order;

    if (paymentPlan === "monthly") {
      return await this.startMonthlyPayment({
        order,
      });
    }

    return await this.startFullPricePayment({
      order,
    });
  },

  async startFullPricePayment({ order }): Promise<StartCheckoutResponse> {
    const {
      course: { stripePriceData },
      fullPrice,
      paymentMethod,
      email,
    } = order;

    const payment = await strapi.documents("api::payment.payment").create({
      data: {
        paymentMethod,
        value: fullPrice,
        order: order.documentId,
        state: "New",
        paymentDueDate: addDays(new Date(), 3),
      },
    });

    if (paymentMethod === "transfer") {
      return {
        paymentDocumentId: payment.documentId,
        orderDocumentId: order.documentId,
      };
    }

    const session = await stripeApi.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceData.fullPriceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: buildSuccessUrl(order.documentId, payment.documentId),
      cancel_url: buildCancelUrl(order.documentId),
      customer_email: email,
      metadata: {
        paymentId: payment.documentId,
        orderNumber: order.orderNumber,
      },
    });
    console.log("session: ", session);

    return {
      redirectUrl: session.url,
      paymentDocumentId: payment.documentId,
      orderDocumentId: order.documentId,
    };
  },

  async startMonthlyPayment({ order }) {
    const {
      course: { stripePriceData },
      monthPrice,
      paymentMethod,
      email,
      course,
    } = order;

    const firstPayment = await strapi.documents("api::payment.payment").create({
      data: {
        paymentMethod,
        value: monthPrice,
        order: order.documentId,
        state: "New",
        paymentDueDate: addDays(new Date(), 3),
      },
    });

    const payments = [];
    for (let i = 1; i < course.durationMonths; i++) {
      const payment = await strapi.documents("api::payment.payment").create({
        data: {
          paymentMethod,
          value: monthPrice,
          order: order.documentId,
          state: "Future",
          paymentDueDate: addDays(new Date(), 3 + i * 30),
        },
      });
      payments.push(payment);
    }

    if (paymentMethod === "transfer") {
      const session = await stripeApi.checkout.sessions.create({
        line_items: [
          {
            price: stripePriceData.monthPriceId,
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: buildSuccessUrl(order.documentId, firstPayment.documentId),
        cancel_url: buildCancelUrl(order.documentId),
        customer_email: email,
        payment_method_options: {},
      });
      return session;
    }

    const session = await stripeApi.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceData.monthPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: buildSuccessUrl(order.documentId, firstPayment.documentId),
      cancel_url: buildCancelUrl(order.documentId),
      customer_email: email,
    });
  },
  async bankTransferPaymentInfo(paymentId) {
    const payment = await strapi.documents("api::payment.payment").findOne({
      documentId: paymentId,
      fields: ["paymentDueDate", "state"],
      populate: {
        value: {
          populate: "*",
        },
        order: {
          fields: ["orderNumber", "paymentPlan", "email"],
          populate: {
            course: {
              fields: ["name", "dateStart"],
            },
          },
        },
      },
    });

    if (!payment) {
      return null;
    }

    const {
      paymentDueDate,
      value,
      order: {
        email,
        orderNumber,
        course: { name: courseName, dateStart },
        paymentPlan,
      },
      state,
    } = payment;

    return {
      orderNumber,
      paymentDueDate,
      value,
      email,
      state,
      courseName,
      dateStart,
      paymentPlan,
    };
  },
};
