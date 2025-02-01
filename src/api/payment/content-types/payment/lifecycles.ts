export default {
  async afterUpdate({ result: { documentId, state } }) {
    if (state === "Completed") {
      await strapi
        .service("api::order.order")
        .checkIfOrderFullyPaid(documentId);
    }
  },
};
