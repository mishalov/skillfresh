/**
 * lead controller
 */

import { factories } from "@strapi/strapi";

export default factories.createCoreController("api::lead.lead", ({}) => ({
  async checkLeadStatus(ctx) {
    const { leadDocumentId } = ctx.params;

    return await strapi
      .service("api::lead.lead")
      .checkLeadStatus(leadDocumentId);
  },
}));
