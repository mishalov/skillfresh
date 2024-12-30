/**
 * template-course controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::template-course.template-course",
  ({ strapi }) => ({
    async findOne(ctx) {
      const { data, meta } = await super.findOne(ctx);

      const dataWithNotifications = await strapi
        .service("api::template-course.template-course")
        .addNotifications(data);

      return { data: dataWithNotifications, meta };
    },
  })
);
