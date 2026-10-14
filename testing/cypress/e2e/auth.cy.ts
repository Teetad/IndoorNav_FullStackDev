const backendUrl = () => (Cypress.env("BACKEND_URL") as string).replace(/\/$/, "");
const oauthOrigin = "https://oauth497.cpecmu.com";

const headerValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value.join(";") : value ?? "";

const jsonFromDocumentBody = <T>(): Cypress.Chainable<T> =>
  cy.document().then((document) => {
    const rawBody = document.body.innerText.trim();
    return JSON.parse(rawBody) as T;
  }) as unknown as Cypress.Chainable<T>;

type LoginResponse = {
  token: string;
  token_type: "Bearer";
  expires_in: number;
  user: {
    user_id: string;
    email: string;
    display_name: string | null;
    role: "USER" | "ADMIN" | "DEVELOPER";
  };
};

describe("pj-backend auth API", () => {
  it("starts the JSON OAuth login flow at the CPE OAuth server", () => {
    cy.request({
      url: `${backendUrl()}/auth/login?mode=json`,
      followRedirect: false,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(302);
      expect(res.redirectedToUrl).to.include(
        `${oauthOrigin}/application/o/authorize/`,
      );
      expect(res.redirectedToUrl).to.include("response_type=code");
      expect(res.redirectedToUrl).to.include("scope=");
      expect(res.redirectedToUrl).to.include("state=");

      const cookies = headerValue(res.headers["set-cookie"]);
      expect(cookies).to.include("oauth_state=");
      expect(cookies).to.include("oauth_mode=json");
    });
  });

  it("rejects callback requests without code and state", () => {
    cy.request({
      url: `${backendUrl()}/auth/callback`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("code and state are required");
    });
  });

  it("rejects protected auth endpoints without a session token", () => {
    cy.request({
      url: `${backendUrl()}/auth/me`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Session token is required");
    });
  });

  it("rejects protected auth endpoints with an invalid bearer token", () => {
    cy.request({
      url: `${backendUrl()}/auth/me`,
      headers: { Authorization: "Bearer not-a-real-session-token" },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Session token is invalid or expired");
    });
  });

  it("logs out by clearing the session cookie", () => {
    cy.request("POST", `${backendUrl()}/auth/logout`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Logged out");

      const cookies = headerValue(res.headers["set-cookie"]);
      expect(cookies).to.include("session_token=;");
    });
  });

  it("can log in through CPE OAuth and use the returned backend token", function () {
    const username = Cypress.env("OAUTH_TEST_USERNAME") as string | undefined;
    const password = Cypress.env("OAUTH_TEST_PASSWORD") as string | undefined;

    if (!username) {
      this.skip();
      return;
    }

    cy.visit(`${backendUrl()}/auth/login?mode=json`);

    cy.origin(
      oauthOrigin,
      { args: { username, password: password ?? "1234567890" } },
      ({ username, password }) => {
        cy.get(
          "input[type='text'], input[type='email'], input[name*='user'], input[name*='email'], input[id*='user'], input[id*='email']",
        )
          .first()
          .clear()
          .type(username, { log: false });
        cy.get("input[type='password']")
          .first()
          .clear()
          .type(password, { log: false });
        cy.get("button[type='submit'], input[type='submit']").first().click();
      },
    );

    cy.location("pathname", { timeout: 60_000 }).should("include", "/auth/callback");
    cy.contains('"token"', { timeout: 60_000 }).should("be.visible");

    jsonFromDocumentBody<LoginResponse>().then((login) => {
      expect(login.token).to.be.a("string").and.not.be.empty;
      expect(login.token_type).to.equal("Bearer");
      expect(login.expires_in).to.equal(28_800);
      expect(login.user.email).to.include("@");
      expect(login.user.role).to.be.oneOf(["USER", "ADMIN", "DEVELOPER"]);

      cy.request({
        url: `${backendUrl()}/auth/me`,
        headers: { Authorization: `Bearer ${login.token}` },
      }).then((res) => {
        expect(res.status).to.equal(200);
        expect(res.body.email).to.equal(login.user.email);
        expect(res.body.role).to.equal(login.user.role);
      });
    });
  });
});
