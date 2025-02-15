import { Core } from "@strapi/strapi";
import { addDays } from "date-fns";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async getNextPayment({ orderDocumentId, limited }) {
    const order = await strapi.documents("api::order.order").findOne({
      documentId: orderDocumentId,
    });

    if (!order || order?.state === "Paid") {
      return null;
    }
    console.log("order: ", order);

    const dateCondition = limited
      ? {
          $between: [new Date(), addDays(new Date(), 2)],
        }
      : {
          $gte: new Date(),
        };

    return await strapi.documents("api::payment.payment").findMany({
      filters: {
        order: {
          documentId: {
            $eq: order.documentId,
          },
        },
        // dueDate: dateCondition as any,
      },
      limit: 1,
    });
  },
});
