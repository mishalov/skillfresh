import path from "path";

export default {
  routes: [
    {
      method: "POST",
      path: "/checkout/start/:courseDocumentId",
      handler: "checkout.start",
      config: {
        auth: false,
      },
    },
    {
      method: "POST",
      path: "/checkout/success/:orderDocumentId",
      handler: "checkout.success",
      config: {
        auth: false,
      },
    },
    {
      method: "GET",
      path: "/checkout/bank-transfer/:paymentDocumentId",
      handler: "checkout.bankTransferPaymentInfo",
      config: {
        auth: false,
      },
    },
  ],
};
