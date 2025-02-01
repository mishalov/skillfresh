export default {
  async start(ctx) {
    const { courseDocumentId } = ctx.params;

    return await strapi.service("api::checkout.start").start({
      courseDocumentId,
      ...ctx.request.body,
    });
  },

  async confirm(ctx) {
    const { paymentDocumentId, sessionId, orderDocumentId } = ctx.query;

    return await strapi
      .service("api::checkout.confirmation")
      .confirmPayment({ paymentDocumentId, sessionId, orderDocumentId });
  },

  async bankTransferPaymentInfo(ctx) {
    const { paymentDocumentId } = ctx.params;

    return await strapi
      .service("api::checkout.bank")
      .bankTransferPaymentInfo(paymentDocumentId);
  },

  async getOrderStatus(ctx) {
    const { orderDocumentId } = ctx.params;

    return await strapi
      .service("api::checkout.status")
      .getOrderStatus(orderDocumentId);
  },
};
