/**
 * order service
 */

import { Core, factories } from "@strapi/strapi";

export default factories.createCoreService(
  "api::order.order",
  ({ strapi }: { strapi: Core.Strapi }) => ({
    async checkIfOrderFullyPaid(paymentDocumentId) {
      if (!paymentDocumentId) {
        return null;
      }

      const {
        order: {
          countOfPayments,
          state,
          payments,
          documentId: orderDocumentId,
        },
      } = await strapi.documents("api::payment.payment").findOne({
        documentId: paymentDocumentId,
        populate: {
          order: {
            fields: ["countOfPayments", "state"],
            populate: {
              payments: {
                fields: ["state"],
              },
            },
          },
        },
      });

      // Check if all payments are completed
      if (
        payments.filter((payment) => payment.state === "Completed").length ===
        countOfPayments
      ) {
        await strapi.documents("api::order.order").update({
          documentId: orderDocumentId,
          data: {
            state: "Paid",
          },
        });

        return;
      }

      // Check if any payment is completed
      if (
        payments.filter((payment) => payment.state === "Completed").length >
          0 &&
        state === "Not Paid"
      ) {
        console.log("Partially paid");
        await strapi.documents("api::order.order").update({
          documentId: orderDocumentId,
          data: {
            state: "Partially paid",
          },
        });
      }
    },
  })
);
