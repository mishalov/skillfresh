export const appUrl = `http://${process.env.FRONTEND_HOSTNAME}`;

export const buildSuccessUrl = (paymentId) =>
  `${appUrl}/payment/success/${paymentId}?sessionId={CHECKOUT_SESSION_ID}`;

export const buildOrderStatusUrl = (orderDocumentId: string) =>
  `${appUrl}/order/status/${orderDocumentId}`;

export const buildCancelUrl = (paymentId: string) =>
  `${appUrl}/order/card/cancel?paymentDocumentId=${paymentId}`;

export const buildPasswordCreationUrl = (
  userDocumentId: string,
  tempPassword: string
) =>
  `${appUrl}/student/create-password?userDocumentId=${userDocumentId}&tempPassword=${tempPassword}`;

export const buildDashboardUrl = () => `${appUrl}/student/dashboard`;
