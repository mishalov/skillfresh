/**
 * template-course service
 */

import { factories } from "@strapi/strapi";
import {
  createFullPriceStripe,
  createMonthPriceStripe,
} from "../../../services/StripeApi";

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
    async startCourse({
      templateCourseDocumentId,
      dateStart,
      teacherDocumentIds,
      workshopDates,
    }) {
      const templateCourse = await strapi
        .documents("api::template-course.template-course")
        .findOne({
          documentId: templateCourseDocumentId,
          fields: [
            "name",
            "description",
            "discount",
            "totalAmountOfLessons",
            "notionLink",
            "durationMonths",
            "workshopsPerWeek",
            "totalAmountOfWorkshops",
            "workshopDuration",
            "discordLink",
          ],
          populate: [
            "templateLessons",
            "monthPrice",
            "fullPrice",
            "stripeProductData",
            "cover",
          ],
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
        stripeProductData,
        cover,
        workshopDuration,
        discordLink,
      } = templateCourse;

      const subscriptionStripeData = await createMonthPriceStripe({
        monthPrice,
        productId: stripeProductData.stripeProductIdMonthly,
      });

      const fullPriceStripeData = await createFullPriceStripe({
        fullPrice,
        productId: stripeProductData.stripeProductIdFull,
      });

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
          stripePriceData: {
            fullPriceId: fullPriceStripeData?.id,
            monthPriceId: subscriptionStripeData?.id,
          },
          cover,
          workshopDuration,
          discordLink,
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

      const workshops = await strapi
        .service("api::workshop.workshop")
        .createWorkshops({
          teacherDocumentIds,
          dates: workshopDates,
          courseDocumentId: newCourse.documentId,
        });

      const updated = await strapi.documents("api::course.course").update({
        documentId: newCourse.documentId,
        data: {
          lessons,
          workshops,
        },
      });

      await strapi.documents("api::course.course").publish({
        documentId: updated.documentId,
      });

      return strapi.documents("api::course.course").findOne({
        documentId: updated.documentId,
        populate: ["lessons"],
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
