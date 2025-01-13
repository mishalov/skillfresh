/**
 * lead service
 */

import { factories } from "@strapi/strapi";
import { telegramApi } from "../../../services/TelegramApi";

export default factories.createCoreService("api::lead.lead", ({ strapi }) => {
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
  };
});
