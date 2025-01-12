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
        fields: ["name", "dateStart", "durationMonths"],
        populate: ["templateCourse", "monthPrice", "fullPrice"],
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
      console.log("course: ", course);

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
