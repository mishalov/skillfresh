/**
 * course controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::course.course",
  ({ strapi }) => ({
    async publicCourse(ctx) {
      const { documentId } = ctx.params;

      const course = await strapi
        .service("api::course.course")
        .findOne({ documentId });
      console.log("course: ", course);

      return course;
    },
  })
);
