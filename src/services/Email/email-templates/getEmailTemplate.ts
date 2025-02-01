import fs from "fs";

type AvailableTemplates = "order-confirmation" | "password-created";
type AvailableTemplateLocales = "en" | "cz" | "ru";

const getEmailTemplate = (
  templateName: AvailableTemplates,
  locale: AvailableTemplateLocales = "en"
) =>
  fs.readFileSync(
    `src/services/Email/email-templates/${locale}/${templateName}.html`,
    "utf-8"
  );

export default getEmailTemplate;
