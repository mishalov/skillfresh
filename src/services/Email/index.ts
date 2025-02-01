import { Data } from "@strapi/strapi";
import getEmailTemplate from "./email-templates/getEmailTemplate";
import {
  buildDashboardUrl,
  buildOrderStatusUrl,
  buildPasswordCreationUrl,
} from "../../utils/buildRoutes";

const emailService = {
  orderConfirmation: async (order: Data.Entity<"api::order.order">) => {
    const {
      course,
      orderNumber,
      documentId: orderDocumentId,
      user: { email, documentId: studentDocumentId, tempPassword, firstName },
    } = order;

    return await strapi.plugins["email"].services.email.sendTemplatedEmail(
      {
        to: email,
      },
      {
        subject: `Order confirmation: ${course.name}`,
        html: getEmailTemplate("order-confirmation", "en"),
        text: "",
      },
      {
        passwordCreationLink: buildPasswordCreationUrl(
          studentDocumentId,
          tempPassword
        ),
        firstName: firstName,
        dashboardUrl: buildDashboardUrl(),
        orderStatusUrl: buildOrderStatusUrl(orderDocumentId),
        courseName: course.name,
        orderNumber,
      }
    );
  },

  passwordCreated: async (
    student: Data.Entity<"plugin::users-permissions.user">
  ) => {
    const { email, firstName } = student;

    await strapi.plugins["email"].services.email.sendTemplatedEmail(
      {
        to: email,
      },
      {
        subject: `Password created`,
        html: getEmailTemplate("password-created", "en"),
        text: "",
      },
      {
        firstName,
        dashboardUrl: buildDashboardUrl(),
      }
    );
  },
};

export default emailService;
