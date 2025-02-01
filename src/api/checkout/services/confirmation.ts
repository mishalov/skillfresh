import { addMonths } from "date-fns";
import { stripeApi } from "../../../services/StripeApi";
import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async confirmPayment({ paymentDocumentId, sessionId }) {
    let payment = await strapi.documents("api::payment.payment").findOne({
      documentId: paymentDocumentId,
      fields: ["state"],
      populate: "order",
    });

    const orderDocumentId = payment.order.documentId;

    let order = await strapi.documents("api::order.order").findOne({
      documentId: orderDocumentId,
      fields: ["email", "orderNumber", "firstName", "lastName"],
      populate: {
        lead: {},
        course: {
          fields: ["name", "dateStart", "durationMonths"],

          populate: ["stripePriceData"],
        },
        payments: {
          fields: ["state", "dueDate"],

          populate: {
            value: {
              fields: ["amount", "currency"],
            },
          },
        },
      },
    });

    if (!payment) {
      return { success: false, message: "Payment not found" };
    }

    if (payment.state === "Completed") {
      return { success: true, message: "Payment already completed" };
    }

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

    payment = await strapi.documents("api::payment.payment").update({
      documentId: paymentDocumentId,
      data: {
        state: "Completed",
        paidAt: new Date(),
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
                price: order.course.stripePriceData.monthPriceId,
              },
            ],
            iterations: order.course.durationMonths - 1,
          },
        ],
      });
    }

    const newStudent = await strapi
      .service("api::student.create")
      .fromOrder(order);

    order = await strapi.documents("api::order.order").update({
      documentId: order.documentId,
      data: {
        user: newStudent.documentId,
      },
      fields: ["orderNumber"],
      populate: {
        lead: {},
        course: {
          fields: ["name", "dateStart", "durationMonths"],
        },
        user: {
          fields: ["firstName", "lastName", "email", "tempPassword"],
        },
      },
    });

    strapi.service("api::order.confirmation").sendOrderConfirmationEmail(order);

    return {
      success: true,
      message: "Payment completed",
      orderDocumentId: order.documentId,
    };
  },
});
