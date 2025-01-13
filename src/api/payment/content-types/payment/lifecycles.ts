export default {
  async afterUpdate({ result: { documentId, state } }) {
    console.log("documentId: ", documentId);
    if (state === "Completed") {
      await strapi
        .service("api::order.order")
        .checkIfOrderFullyPaid(documentId);
    }
  },
};
