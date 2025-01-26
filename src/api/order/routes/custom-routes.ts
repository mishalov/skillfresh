export default {
  routes: [
    {
      method: "GET",
      path: "/order-status/:orderDocumentId",
      handler: "order.getOrderStatus",
      config: {
        auth: false,
      },
    },
  ],
};
