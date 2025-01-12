/**
 * order service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }) => ({
    async createOrder(data) {},
  })
);
