/**
 * project-result controller
 */

import { Core, factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::project-result.project-result",
  ({ strapi }) => ({
    async getSingle({ params, state: { user } }) {
      const { documentId: projectResultDocumentId } = params;
      const {
        documentId: userDocumentId,
        role: { type },
      } = user;

      if (type === "teacher" || type === "admin") {
        return strapi.service("api::project-result.get").forTeacher({
          projectResultDocumentId,
          teacherDocumentId: userDocumentId,
        });
      }

      return strapi.service("api::project-result.get").forStudent({
        projectResultDocumentId,
        studentDocumentId: userDocumentId,
      });
    },

    async updateReview({ request: { body }, params, state: { user } }) {
      const { documentId: projectResultDocumentId } = params;
      const {
        documentId: reviewerDocumentId,
        role: { type },
      } = user;

      if (type !== "teacher" && type !== "admin") {
        throw new Error("Forbidden");
      }

      return strapi.service("api::project-result.update").review({
        ...body,
        projectResultDocumentId,
        reviewerDocumentId,
      });
    },
  })
);
