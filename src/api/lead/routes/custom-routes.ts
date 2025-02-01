import routes from "../../teacher/routes";

export default {
  routes: [
    {
      method: "GET",
      path: "/lead-status/:leadDocumentId",
      handler: "lead.checkLeadStatus",
      config: {
        auth: false,
      },
    },
  ],
};
