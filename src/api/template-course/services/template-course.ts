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
  () => ({
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
  })
);
