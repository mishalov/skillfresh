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

      const availableCourses = await strapi
        .service("api::template-course.template-course")
        .getAvailableCourses(course.templateCourse.documentId);

      return {
        course,
        availableCourses,
      };
    },

    async getUserCourses(userDocumentId) {
      return strapi.documents("plugin::users-permissions.user").findOne({
        documentId: userDocumentId,
        fields: [],
        populate: ["coursesAsStudent"],
      });
    },

    async getDefaultCourse(userDocumentId) {
      const courseFields = {
        fields: [
          "name",
          "dateStart",
          "durationMonths",
          "description",
          "discordLink",
        ],
        populate: {
          lessons: {
            fields: ["name", "duration", "description", "notionLink"],
            populate: {
              chapter: {
                fields: ["name", "description"],
                populate: ["cover"],
              },
            },
          },
          workshops: {
            fields: ["date", "description"],
          },
          cover: {
            fields: "*",
          },
        },
      } as any;

      const user = await strapi
        .documents("plugin::users-permissions.user")
        .findOne({
          documentId: userDocumentId,
          fields: [],
          populate: {
            coursesAsStudent: courseFields,
            defaultCourse: courseFields,
          },
        });

      return user.defaultCourse || user.coursesAsStudent[0];
    },
  })
);
