import TelegramBot from "node-telegram-bot-api";

class TelegramApi {
  tokenLeads: string;
  recipientId: string;

  constructor(tokenLeads: string, recipientId: string) {
    this.tokenLeads = tokenLeads;
    this.recipientId = recipientId;
  }

  notifyAboutLead(lead: any) {
    const bot = new TelegramBot(this.tokenLeads, { polling: false });
    const message = `🚀 New lead from <b>${lead.source}</b> 🚀\n\nName: <a href="${lead.link}">${lead.name}</a>\n${lead.contactType} : ${lead[lead.contactType]}\n\n${lead.text}`;
    bot.sendMessage(process.env.TELEGRAM_RECIPIENT_ID, message, {
      parse_mode: "HTML",
    });
  }
}

export const telegramApi = new TelegramApi(
  process.env.TELEGRAM_TOKEN_LEADS,
  process.env.TELEGRAM_RECIPIENT_ID
);

export default TelegramApi;
