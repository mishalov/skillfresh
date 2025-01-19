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

    async myCourses(ctx) {
      const user = ctx.state.user;

      const courses = await strapi
        .service("api::course.course")
        .getUserCourses(user.documentId);

      return courses.coursesAsStudent;
    },

    async myCourse(ctx) {
      const user = ctx.state.user;

      const course = await strapi
        .service("api::course.course")
        .getUserDefaultCourse(user.documentId);

      return course;
    },
  })
);
