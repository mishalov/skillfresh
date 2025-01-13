export const appUrl = `http://${process.env.FRONTEND_HOSTNAME}`;
export const buildSuccessUrl = (paymentId: string) =>
  `${appUrl}/payment/card/success?paymentDocumentId=${paymentId}&sessionId={CHECKOUT_SESSION_ID}`;

export const buildCancelUrl = (paymentId: string) =>
  `${appUrl}/payment/card/cancel?paymentDocumentId=${paymentId}`;
