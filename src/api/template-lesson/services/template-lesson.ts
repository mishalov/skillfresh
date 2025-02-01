/**
 * template-lesson service
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::template-lesson.template-lesson",
  ({ strapi }) => ({
    async createLessonFromTemplate({ templateLessonDocumentId, courseId }) {
      const { name, duration, description, innerInfo, notionLink, chapter } =
        await strapi.documents("api::template-lesson.template-lesson").findOne({
          documentId: templateLessonDocumentId,
          select: [
            "name",
            "duration",
            "description",
            "innerInfo",
            "notionLink",
          ],
          populate: ["chapter"],
        });

      const lesson = await strapi.documents("api::lesson.lesson").create({
        data: {
          name,
          duration,
          description,
          innerInfo,
          notionLink,
          course: courseId,
          publishedAt: new Date(),
          revealed: false,
          templateLesson: templateLessonDocumentId,
          chapter,
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
