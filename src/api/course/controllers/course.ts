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
        .getPublicCourse(documentId);

      return course;
    },
    async paymentPageData(ctx) {
      const { courseDocumentId } = ctx.params;

      return strapi
        .service("api::course.course")
        .getCoursePaymentPageData(courseDocumentId);
    },
  })
);
