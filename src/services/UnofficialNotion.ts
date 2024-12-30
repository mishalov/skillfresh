// import fetch from "node-fetch";

const _BASEURL = "https://www.notion.so/api/v3";

const res = {
  json(data, status) {
    return new Response(JSON.stringify({ data }), {
      status,
      headers: {
        "content-type": "application/json",
      },
    });
  },
};

function uuidv4() {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: string) =>
    (
      Number(c) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(c) / 4)))
    ).toString(16)
  );
}

function id2uuid(id) {
  return `${id.substr(0, 8)}-${id.substr(8, 4)}-${id.substr(12, 4)}-${id.substr(
    16,
    4
  )}-${id.substr(20)}`;
}

class UnofficialNotionClient {
  headers: { Cookie: string; "Content-Type": string };

  constructor(private token: string) {
    this.headers = {
      Cookie: `token_v2=${token};`,
      "Content-Type": "application/json",
    };
  }

  public async getSpace(name: string) {
    console.log("this.headers: ", this.headers);

    const res = await fetch(`${_BASEURL}/getSpaces`, {
      method: "POST",
      headers: this.headers,
    });
    const data = await res.json();
    console.log("NEW DATA: ", data);
    const userSpaces = data[Object.keys(data)[0]].space;
    const userSpacesIds = Object.keys(userSpaces);

    return userSpacesIds.find(
      (spaceId) =>
        userSpaces[spaceId].value.name.toLowerCase() === name.toLowerCase()
    ) as any;
  }

  public async createEmailUser(email: string) {
    const body = {
      email: email,
      preferredLocaleOrigin: "inferred_from_inviter",
      preferredLocale: "en-US",
    };
    const res = await fetch("https://www.notion.so/api/v3/createEmailUser", {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return await res.json();
  }

  public generateTransaction(
    userId: string,
    spaceId: string,
    pageId: string,
    permission: string
  ) {
    const permissions = {
      edit: "read_and_write",
      comment: "comment_only",
      view: "reader",
      fullaccess: "editor",
      delete: "none",
    };
    return {
      requestId: uuidv4(),
      transactions: [
        {
          id: uuidv4(),
          spaceId: spaceId,
          debug: { userAction: "permissionsActions.savePermissionItems" },
          operations: [
            {
              pointer: {
                table: "block",
                id: id2uuid(pageId),
                spaceId: spaceId,
              },
              command: "setPermissionItem",
              path: ["permissions"],
              args: {
                type: "user_permission",
                role: permissions[permission] || permissions["comment"],
                user_id: userId,
              },
            },
            {
              pointer: {
                table: "block",
                id: id2uuid(pageId),
                spaceId: spaceId,
              },
              path: [],
              command: "update",
              args: { last_edited_time: Date.now() },
            },
          ],
        },
      ],
    };
  }

  public async inviteGuestsToSpace(
    pageId: string,
    spaceId: string,
    userId: string,
    permission
  ) {
    const body = this.generateTransaction(userId, spaceId, pageId, permission);

    const res = await fetch("https://www.notion.so/api/v3/saveTransactions", {
      headers: this.headers,
      body: JSON.stringify(body),
      method: "POST",
    });
    return await res.json();
  }

  public async findUser(email: string) {
    const body = { email: email };

    const res = await fetch("https://www.notion.so/api/v3/findUser", {
      headers: this.headers,
      body: JSON.stringify(body),
      method: "POST",
    });
    return await res.json();
  }

  public async getData(request: Request, contentType: string) {
    if (contentType.includes("application/json")) {
      return JSON.stringify(await request.json());
    } else if (contentType.includes("application/text")) {
      return request.text();
    } else if (contentType.includes("text/html")) {
      return request.text();
    } else if (contentType.includes("form")) {
      const formData = await request.formData();
      const body = {};
      for (const entry of formData.entries()) {
        body[entry[0]] = entry[1];
      }
      return JSON.stringify(body);
    }
  }

  //   async function viaSlack(data, error, SLACK_WEBHOOK) {
  //     const { workspace, email, pageid } = data;
  //     let content;
  //     if (error) {
  //       content = {
  //         blocks: [
  //           {
  //             type: "header",
  //             text: {
  //               type: "plain_text",
  //               text: `⚠️ Error`,
  //               emoji: true,
  //             },
  //           },
  //           {
  //             type: "section",
  //             text: {
  //               type: "mrkdwn",
  //               text: `Invitation failed.\n- Error: ${error}\n please update your Notion token (TOKEN_V2) in your Cloudflare worker`,
  //             },
  //           },
  //         ],
  //       };
  //     } else {
  //       content = {
  //         blocks: [
  //           {
  //             type: "header",
  //             text: {
  //               type: "plain_text",
  //               text: `👤 A new user has joined.`,
  //               emoji: true,
  //             },
  //           },
  //           {
  //             type: "section",
  //             text: {
  //               type: "mrkdwn",
  //               text: `- Workspace: ${workspace}\n- Page: https://notion.so/${pageid}\n- Email: ${email}
  //             `,
  //             },
  //           },
  //         ],
  //       };
  //     }

  //     await fetch(SLACK_WEBHOOK, {
  //       method: "POST",
  //       body: JSON.stringify(content),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //   }

  //   public async function notify(data, error, env) {
  //     if (typeof env.SLACK_WEBHOOK !== "undefined")
  //       await viaSlack(data, error, env.SLACK_WEBHOOK);
  //     // if (typeof DISCORD_WEBHOOK !== "undefined") await _discord(data, error);
  //   }
}

export default UnofficialNotionClient;
