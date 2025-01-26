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
    async startCourse(ctx) {
      const { templateCourseDocumentId } = ctx.params;
      const { dateStart, teacherDocumentIds, workshopDates } = ctx.request.body;

      return strapi
        .service("api::template-course.template-course")
        .startCourse({
          templateCourseDocumentId,
          dateStart,
          workshopDates,
          teacherDocumentIds,
        });
    },

    async availableCourses(ctx) {
      const { courseTemplateDocumentId } = ctx.params;

      const courses = await strapi
        .service("api::template-course.template-course")
        .getAvailableCourses(courseTemplateDocumentId);

      return courses;
    },
  })
);
