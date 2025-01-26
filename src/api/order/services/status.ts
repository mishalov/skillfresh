export default ({ strapi }) => ({
  async getOrderStatus(orderDocumentId) {
    const order = await strapi.documents("api::order.order").findOne({
      documentId: orderDocumentId,
      fields: ["state"],
      populate: {
        payments: {
          fields: ["state", "dueDate", "paidAt"],
          populate: {
            value: "*",
          },
        },
        course: {
          fields: ["name", "dateStart"],
          populate: ["stripePriceData"],
        },
        user: {
          fields: ["email"],
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
      user: { email },
    } = order;
    return {
      email,
      courseName,
      dateStart,
      orderNumber,
      payments,
    };
  },
});
