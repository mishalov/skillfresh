import { addDays, addMonths } from "date-fns";
import { stripeApi } from "../../../services/StripeApi";
import { buildCancelUrl, buildSuccessUrl } from "../../../utils/buildRoutes";

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
      value,
      paymentMethod,
      email,
    } = order;

    const payment = await strapi.documents("api::payment.payment").create({
      data: {
        paymentMethod,
        value,
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
      success_url: buildSuccessUrl(payment.documentId),
      cancel_url: buildCancelUrl(payment.documentId),
      customer_email: email,
      metadata: {
        paymentId: payment.documentId,
        orderNumber: order.orderNumber,
      },
    });

    return {
      redirectUrl: session.url,
      paymentDocumentId: payment.documentId,
      orderDocumentId: order.documentId,
    };
  },

  async startMonthlyPayment({ order }) {
    const {
      course: { stripePriceData },
      value,
      paymentMethod,
      email,
      course,
      orderNumber,
    } = order;

    const firstPayment = await strapi.documents("api::payment.payment").create({
      data: {
        value,
        paymentMethod,
        order: order.documentId,
        state: "New",
        paymentDueDate: addDays(new Date(), 3),
      },
    });
    const paymentDocumentId = firstPayment.documentId;
    const orderDocumentId = order.documentId;

    const payments = [];
    for (let i = 1; i < course.durationMonths; i++) {
      const payment = await strapi.documents("api::payment.payment").create({
        data: {
          value,
          paymentMethod,
          order: orderDocumentId,
          state: "Future",
          paymentDueDate: addDays(new Date(), 3 + i * 30),
        },
      });
      payments.push(payment);
    }

    const session = await stripeApi.checkout.sessions.create({
      line_items: [
        {
          price: stripePriceData.monthPriceId,
          quantity: 1,
        },
      ],
      mode: paymentMethod === "transfer" ? "payment" : "subscription",
      success_url: buildSuccessUrl(paymentDocumentId),
      cancel_url: buildCancelUrl(paymentDocumentId),
      customer_email: email,
      metadata: {
        paymentId: paymentDocumentId,
        orderNumber: orderNumber,
      },
    });

    return {
      redirectUrl: session.url,
      paymentDocumentId: paymentDocumentId,
      orderDocumentId: orderDocumentId,
    };
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

  async confirmPayment({ paymentDocumentId, sessionId }) {
    const stripePayment = await stripeApi.checkout.sessions.retrieve(sessionId);

    if (
      !stripePayment ||
      !(stripePayment.metadata.paymentId === paymentDocumentId)
    ) {
      return { success: false, message: "Payment not found or invalid" };
    }

    if (stripePayment.payment_status !== "paid") {
      return { success: false, message: "Payment not paid" };
    }

    const payment = await strapi.documents("api::payment.payment").update({
      documentId: paymentDocumentId,
      data: {
        state: "Completed",
      },
      populate: {
        order: {
          populate: {
            course: {
              fields: ["name", "dateStart", "durationMonths"],
              populate: ["stripePriceData"],
            },
          },
        },
      },
    });

    if (stripePayment.mode === "subscription") {
      await stripeApi.subscriptionSchedules.create({
        customer: stripePayment.customer.toString(),
        end_behavior: "cancel",
        start_date: Math.trunc(addMonths(new Date(), 1).getTime() / 1000),
        phases: [
          {
            items: [
              {
                price: payment.order.course.stripePriceData.monthPriceId,
              },
            ],
            iterations: payment.order.course.durationMonths - 1,
          },
        ],
      });
    }

    return {
      email: payment.order.email,
      courseName: payment.order.course.name,
      startDate: payment.order.course.dateStart,
      success: true,
    };
  },
};
