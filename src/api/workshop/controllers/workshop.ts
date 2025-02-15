/**
 * workshop controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::workshop.workshop",
  ({ strapi }) => ({
    async getMyNextWorkshop(ctx) {
      const user = ctx.state.user;
      const workshop = await strapi
        .service("api::workshop.workshop")
        .getStudentsNextWorkshop(user.documentId);

      return workshop;
    },
  })
);
