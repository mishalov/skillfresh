export const appUrl = `http://${process.env.HOSTNAME}:${process.env.PORT}`;
export const buildSuccessUrl = (orderId: string, paymentId: string) =>
  `${appUrl}/checkout/success?orderDocumentId=${orderId}&paymentDocumentId=${paymentId}`;

export const buildCancelUrl = (orderId: string) =>
  `${appUrl}/checkout/cancel?orderDocumentId=${orderId}`;

export const buildBankPaymentDetailsUrl = (paymentDocumentId: string) =>
  `${appUrl}/checkout/bank-transfer/requires_action/${paymentDocumentId}`;
