import fs from "fs";

type AvailableTemplates = ["order-confirmation"];
const getEmailTemplate = async (
  templateName: AvailableTemplates,
  locale: string = "en"
) => {
  return fs.readdirSync(
    `src/email-templates/${locale}/${templateName}.html`,
    "utf-8"
  );
};
