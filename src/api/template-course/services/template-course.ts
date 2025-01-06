/**
 * template-course service
 */

import { factories } from "@strapi/strapi";

const createNotification = (
  obj: object,
  name: string,
  blocking: boolean,
  message: string
) => ({
  ...obj,
  [name]: {
    blocking,
    message,
  },
});

export default factories.createCoreService(
  "api::template-course.template-course",
  ({ strapi }) => ({
    async addNotifications(courseTemplateDetails) {
      let notifications = {};

      if (
        courseTemplateDetails.templateLessons.length !==
        courseTemplateDetails.totalAmountOfLessons
      ) {
        notifications = createNotification(
          notifications,
          "notMatchingLessonsCount",
          true,
          `Only ${courseTemplateDetails.templateLessons.length}/${courseTemplateDetails.totalAmountOfLessons} of LessonTemplates assigned. It should match to totalAmountOfLessons field`
        );
      }

      return {
        ...courseTemplateDetails,
        notifications,
      };
    },
    async startCourse({ templateCourseDocumentId, date: dateStart }) {
      const templateCourse = await strapi
        .query("api::template-course.template-course")
        .findOne({
          where: { documentId: templateCourseDocumentId },
          select: [
            "name",
            "description",
            "discount",
            "totalAmountOfLessons",
            "notionLink",
            "durationMonths",
            "workshopsPerWeek",
            "totalAmountOfWorkshops",
          ],
          populate: ["templateLessons.id", "monthPrice", "fullPrice"],
        });

      const {
        name,
        description,
        totalAmountOfLessons,
        notionLink,
        durationMonths,
        workshopsPerWeek,
        totalAmountOfWorkshops,
        discount,
        templateLessons,
        monthPrice,
        fullPrice,
      } = templateCourse;

      const newCourse = await strapi.documents("api::course.course").create({
        data: {
          dateStart: new Date(dateStart),
          name,
          discount,
          description,
          totalAmountOfLessons,
          notionLink,
          durationMonths,
          workshopsPerWeek,
          totalAmountOfWorkshops,
          monthPrice: {
            amount: monthPrice.amount,
            currency: monthPrice.currency,
          },
          fullPrice: {
            amount: fullPrice.amount,
            currency: fullPrice.currency,
          },
          templateCourse,
        },
      });

      const lessons = await Promise.all(
        templateLessons.map((lesson) =>
          strapi
            .service("api::template-lesson.template-lesson")
            .createLessonFromTemplate({
              templateLessonDocumentId: lesson.documentId,
              courseId: newCourse.id,
            })
        )
      );

      const updated = await strapi.documents("api::course.course").update({
        documentId: newCourse.documentId,
        data: {
          lessons,
        },
        populate: ["lessons", "monthPrice", "fullPrice"],
      });

      await strapi.documents("api::course.course").publish({
        documentId: updated.documentId,
      });

      return strapi.documents("api::course.course").findOne({
        documentId: updated.documentId,
        populate: ["lessons", "monthPrice", "fullPrice"],
      });
    },

    async getAvailableCourses(templateCourseDocumentId: string) {
      const courses = await strapi.query("api::course.course").findMany({
        filters: {
          templateCourse: {
            documentId: {
              $eq: templateCourseDocumentId,
            },
          },
          dateStart: {
            $gte: new Date(),
          },
        },
        select: ["documentId"],
      });

      return Promise.all(
        courses.map((course) =>
          strapi
            .service("api::course.course")
            .getPublicCourse(course.documentId)
        )
      );
    },
  })
);
