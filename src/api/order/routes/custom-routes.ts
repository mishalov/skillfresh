import { config } from "process";

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
    {
      method: "POST",
      path: "/order-confirmation/:orderDocumentId",
      handler: "order.sendOrderConfirmationEmail",
      config: {
        auth: false,
      },
    },
  ],
};
