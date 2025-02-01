import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getOrderStatus(orderDocumentId) {
    const order = await strapi.documents("api::order.order").findOne({
      documentId: orderDocumentId,
      fields: ["state", "orderNumber"],
      populate: {
        payments: {
          fields: ["state", "dueDate", "paidAt"],
          populate: ["value"],
        },
        course: {
          fields: ["name", "dateStart"],
          populate: ["stripePriceData"],
        },
        user: {
          fields: ["email", "confirmed"],
        },
      },
    });
    if (!order) {
      return null;
    }
    const {
      payments,
      orderNumber,
      course: { name: courseName, dateStart },
      user: { email, confirmed },
    } = order;

    return {
      email,
      courseName,
      dateStart,
      orderNumber,
      payments,
      isUserConfirmed: confirmed,
    };
  },
});
