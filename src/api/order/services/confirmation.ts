import { Core, Data } from "@strapi/strapi";
import emailService from "../../../services/Email";

export default ({ strapi }: { strapi: Core.Strapi }) => ({
  async sendOrderConfirmationEmail(order: Data.Entity<"api::order.order">) {
    return emailService.orderConfirmation(order);
  },
});
