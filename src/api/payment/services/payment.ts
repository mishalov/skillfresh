/**
 * payment service
 */

import { factories } from "@strapi/strapi";
import { addDays } from "date-fns";

export default factories.createCoreService(
  "api::payment.payment",
  ({ strapi }) => ({
    async getNextPayment({ courseDocumentId, limited }) {
      const order = await strapi.documents("api::course.course").findOne({
        documentId: courseDocumentId,
      });

      if (!order || order?.state === "Completed") {
        return null;
      }

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
          dueDate: dateCondition as any,
        },
        limit: 1,
      });
    },
  })
);
