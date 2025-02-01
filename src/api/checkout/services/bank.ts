export default ({ strapi }) => ({
  async bankTransferPaymentInfo(paymentId) {
    const payment = await strapi.documents("api::payment.payment").findOne({
      documentId: paymentId,
      fields: ["dueDate", "state"],
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
      dueDate,
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
      dueDate,
      value,
      email,
      state,
      courseName,
      dateStart,
      paymentPlan,
    };
  },
});
