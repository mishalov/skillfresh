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
  })
);
