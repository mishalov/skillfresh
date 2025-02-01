/**
 * lead service
 */

import { Core, factories } from "@strapi/strapi";
import { telegramApi } from "../../../services/TelegramApi";

export default factories.createCoreService(
  "api::lead.lead",
  ({ strapi }: { strapi: Core.Strapi }) => {
    return {
      async createFromContactForm(inputs) {
        const result = await strapi.query("api::lead.lead").create(inputs);

        if (result) {
          telegramApi.notifyAboutLead({
            ...inputs.data,
            link: `${process.env.FRONTEND_HOSTNAME}:${process.env.PORT}/admin/content-manager/collection-types/api::lead.lead/${result.documentId}`,
          });
        }
        return result;
      },

      async checkLeadStatus(leadDocumentId) {
        if (!leadDocumentId) {
          return null;
        }

        const { state, orders } = await strapi
          .documents("api::lead.lead")
          .findOne({
            documentId: leadDocumentId,
            fields: ["state"],
            populate: {
              orders: {
                sort: {
                  createdAt: "desc",
                },
              },
            },
          });

        return {
          state,
          orderDocumentId: orders?.[0]?.documentId,
        };
      },
    };
  }
);
