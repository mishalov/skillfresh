import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async forStudent({ projectResultDocumentId, studentDocumentId }) {
    return strapi.documents("api::project-result.project-result").findFirst({
      filters: {
        documentId: {
          $eq: projectResultDocumentId,
        },
        student: {
          documentId: {
            $eq: studentDocumentId,
          },
        },
      },
    });
  },
  async forTeacher({
    projectResultDocumentId,
    teacherDocumentId,
  }: {
    projectResultDocumentId: string;
    teacherDocumentId: string;
  }) {
    const user = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: teacherDocumentId,
        populate: {
          projectResultsAsReviewer: {
            filters: {
              documentId: {
                $eq: projectResultDocumentId,
              },
            },
            populate: {
              resultFiles: {
                fields: "*",
              },
              student: {
                fields: ["firstName", "lastName", "email"],
              },
              project: {
                fields: ["name", "description", "notionLink"],
              },
            },
          },
        },
      });

    if (!user) {
      throw new Error("User not found");
    }

    return user.projectResultsAsReviewer?.[0];
  },
});
