import { Core } from "@strapi/strapi";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async review({ review, state, reviewerDocumentId, projectResultDocumentId }) {
    const reviewer = await strapi
      .documents("plugin::users-permissions.user")
      .findOne({
        documentId: reviewerDocumentId,
        populate: {
          projectResultsAsReviewer: {
            filters: {
              documentId: {
                $eq: projectResultDocumentId,
              },
            },
          },
        },
      });

    if (!reviewer) {
      throw new Error("Reviewer not found");
    }

    if (!reviewer.projectResultsAsReviewer?.[0]) {
      throw new Error("Project result not found");
    }

    return await strapi.documents("api::project-result.project-result").update({
      documentId: projectResultDocumentId,
      data: {
        review,
        state,
      },
    });
  },
});
