import { stripeApi } from "../../../services/StripeApi";
import order from "../../order/controllers/order";

export default {
  async start(ctx) {
    const { courseDocumentId } = ctx.params;

    const {
      leadDocumentId,
      form: {
        paymentPlan,
        companyName,
        email,
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,
        paymentMethod,
      },
    } = ctx.request.body;

    let lead;
    if (leadDocumentId) {
      lead = await strapi.service("api::lead.lead").findOne(leadDocumentId);

      if (lead) {
        strapi.service("api::lead.lead").update(leadDocumentId, {
          state: "in process",
        });
      }
    }

    const course = await strapi
      .service("api::course.course")
      .findOne(courseDocumentId, {
        populate: [
          "templateCourse",
          "stripePriceData",
          "monthPrice",
          "fullPrice",
        ],
      });

    const order = await strapi.documents("api::order.order").create({
      data: {
        state: "Not Paid",
        value: paymentPlan === "monthly" ? course.monthPrice : course.fullPrice,
        payerName: companyName ? companyName : `${firstName} ${lastName}`,
        email,
        paymentMethod,
        paymentPlan,
        course,
        lead,
        countOfPayments: course.templateCourse.durationMonths || 1,
        address: {
          address,
          city,
          postalCode,
          country,
        },
      },
      populate: {
        course: {
          populate: ["stripePriceData", "monthPrice", "fullPrice"],
        },
      },
    });

    return await strapi.service("api::checkout.checkout").start({
      order,
      customerEmail: email,
      paymentPlan,
      paymentMethod,
    });
  },

  async confirm(ctx) {
    const { paymentDocumentId, sessionId } = ctx.query;

    return await strapi
      .service("api::checkout.checkout")
      .confirmPayment({ paymentDocumentId, sessionId });
  },

  async bankTransferPaymentInfo(ctx) {
    const { paymentDocumentId } = ctx.params;

    return await strapi
      .service("api::checkout.checkout")
      .bankTransferPaymentInfo(paymentDocumentId);
  },
};
/**
 * ,
 */
