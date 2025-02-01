import { addDays, addMonths } from "date-fns";
import { stripeApi } from "../../../services/StripeApi";
import { buildCancelUrl, buildSuccessUrl } from "../../../utils/buildRoutes";

export default {
  async start({ leadDocumentId, form, courseDocumentId }) {
    const {
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
    } = form;

    let lead;
    if (leadDocumentId) {
      lead = await strapi.service("api::lead.lead").findOne(leadDocumentId);

      if (lead) {
        strapi.documents("api::lead.lead").update({
          documentId: leadDocumentId,
          data: {
            state: "in process",
          },
        });
      } else {
        lead = await strapi.documents("api::lead.lead").create({
          data: {
            source: "checkout",
            name: `${firstName} ${lastName}`,
            email,
            state: "in process",
          },
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
        companyName,
        firstName,
        lastName,
        email,
        paymentMethod,
        paymentPlan,
        course,
        lead: lead?.documentId,
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
          populate: ["stripePriceData", "monthPrice", "fullPrice", "leads"],
        },
        value: {
          populate: "*",
        },
      },
    });

    let result;
    if (paymentPlan === "monthly") {
      result = await this.startMonthlyPayment({
        order,
      });
    } else {
      result = await this.startFullPricePayment({
        order,
      });
    }

    return { ...result, leadDocumentId, orderDocumentId: order.documentId };
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
        dueDate: addDays(new Date(), 3),
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
        dueDate: addDays(new Date(), 3),
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
          dueDate: addDays(new Date(), 3 + i * 30),
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
      orderNumber: orderNumber,
    };
  },
};
