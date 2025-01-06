/**
 * course service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::course.course",
  ({ strapi }) => ({
    async getPublicCourse(documentId) {
      const course = await strapi.documents("api::course.course").findOne({
        documentId,
        fields: ["name", "dateStart", "durationMonths", "discount"],
        populate: ["templateCourse", "fullPrice", "monthPrice"],
      });

      return {
        ...course,
        templateCourse: {
          documentId: course.templateCourse.documentId,
        },
      };
    },
    async getCoursePaymentPageData(courseDocumentId) {
      const course = await strapi
        .service("api::course.course")
        .getPublicCourse(courseDocumentId);

      const availableCourses = await strapi
        .service("api::template-course.template-course")
        .getAvailableCourses(course.templateCourse.documentId);

      return {
        course,
        availableCourses,
      };
    },
  })
);
