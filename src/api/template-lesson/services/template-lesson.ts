/**
 * template-lesson service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::template-lesson.template-lesson",
  ({ strapi }) => ({
    async createLessonFromTemplate({ templateLessonDocumentId, courseId }) {
      const { name, duration, description, additionalInfo, notionLink } =
        await strapi.documents("api::template-lesson.template-lesson").findOne({
          documentId: templateLessonDocumentId,
          select: [
            "name",
            "duration",
            "description",
            "additionalInfo",
            "notionLink",
          ],
        });

      const lesson = await strapi.documents("api::lesson.lesson").create({
        data: {
          name,
          duration,
          description,
          additionalInfo,
          notionLink,
          course: courseId,
          publishedAt: new Date(),
          revealed: false,
          templateLesson: templateLessonDocumentId,
        },
        populate: ["course", "templateLesson"],
      });

      await strapi.documents("api::lesson.lesson").publish({
        documentId: lesson.documentId,
      });

      return lesson;
    },
  })
);
