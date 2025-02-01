/**
 * order controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::order.order",
  ({ strapi }) => ({
    async getOrderStatus(ctx) {
      const { orderDocumentId } = ctx.params;

      return await strapi
        .service("api::order.status")
        .getOrderStatus(orderDocumentId);
    },
    async sendOrderConfirmationEmail(ctx) {
      const orderDocumentId = ctx.params.orderDocumentId;
      const order = await strapi.documents("api::order.order").findOne({
        documentId: orderDocumentId,
        populate: ["user", "course"],
      });
      return strapi
        .service("api::order.confirmation")
        .sendOrderConfirmationEmail(order);
    },
  })
);
