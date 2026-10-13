const frontendUrl = () => Cypress.env("FRONTEND_URL") as string;

const backendOrigin = "http://localhost:3000";

const samplePlace = {
  place_id: "6371ac8c-4c35-538b-a8a7-4d8ef25b2ec8",
  place_name: "Room 413A",
  place_type: "CLASSROOM",
  room_number: "413A",
  room_status: "OPEN",
  capacity: 40,
  opening_time: "08:00",
  closing_time: "18:00",
  description: "A test classroom returned by Cypress.",
  image_url: null,
  favCount: 0,
  floor_number: 4,
  building_name: "Building 30",
};

const sampleUser = {
  user_id: "c44d1c53-dbd8-4ea0-9bc3-f256e01d90d5",
  email: "student@example.cmu.ac.th",
  display_name: "Cypress Student",
  role: "USER",
};

const stubFrontendApi = () => {
  cy.intercept("GET", `${backendOrigin}/places/types`, [
    "CLASSROOM",
    "LAB",
    "OFFICE",
  ]).as("placeTypes");

  cy.intercept("GET", `${backendOrigin}/places?place_type=CLASSROOM`, [
    samplePlace,
  ]).as("placesByType");

  cy.intercept("GET", `${backendOrigin}/places/${samplePlace.place_id}`, {
    ...samplePlace,
  }).as("placeDetail");

  cy.intercept("GET", `${backendOrigin}/places/${samplePlace.place_id}/reviews`, []).as(
    "placeReviews",
  );

  cy.intercept("GET", `${backendOrigin}/places/${samplePlace.place_id}/images`, []).as(
    "placeImages",
  );
};

describe("pj-frontend", () => {
  beforeEach(() => {
    stubFrontendApi();
  });

  it("renders the default floor map", () => {
    cy.visit(frontendUrl());
    cy.get("input[placeholder='Search location here']").should("be.visible");
    cy.get("img[alt='Floor 4 Map']").should("be.visible");
    cy.contains("Explore").should("be.visible");
    cy.wait("@placeTypes");
  });

  it("navigates between floor routes", () => {
    cy.visit(`${frontendUrl()}/floor-5`);
    cy.get("img[alt='Floor 5 Map']").should("be.visible");

    cy.visit(`${frontendUrl()}/floor-6`);
    cy.get("img[alt='Floor 6 Map']").should("be.visible");

    cy.visit(`${frontendUrl()}/floor-7`);
    cy.get("img[alt='Floor 7 Map']").should("be.visible");
  });

  it("opens category results from backend data", () => {
    cy.visit(frontendUrl());
    cy.wait("@placeTypes");

    cy.contains("button", "CLASSROOM").click();
    cy.wait("@placesByType");
    cy.contains("CLASSROOM").should("be.visible");
    cy.contains(samplePlace.description).should("be.visible");
  });

  it("opens room details from a floor hotspot", () => {
    cy.visit(frontendUrl());
    cy.get("div[style*='66.5%'][style*='18%']").first().click({ force: true });
    cy.wait("@placeDetail");
    cy.contains("Room 413A").should("be.visible");
    cy.contains("A test classroom returned by Cypress.").should("be.visible");
  });

  it("uses room action buttons to start navigation", () => {
    cy.visit(frontendUrl());
    cy.get("div[style*='66.5%'][style*='18%']").first().click({ force: true });
    cy.wait("@placeDetail");

    cy.contains("button", "Start").click();
    cy.location("pathname").should("equal", "/start-navigation");
    cy.location("search").should("equal", "?room=Room%20413A");
  });

  it("navigates with bottom nav buttons", () => {
    cy.intercept("GET", `${backendOrigin}/auth/me`, {
      statusCode: 401,
      body: { message: "Session token is required" },
    }).as("authMeGuest");

    cy.visit(frontendUrl());
    cy.contains("Explore").should("be.visible");

    cy.contains("You").click();
    cy.location("pathname").should("equal", "/login");
    cy.wait("@authMeGuest");
    cy.contains("Please log in").should("be.visible");

  });

  it("shows a clickable login button", () => {
    cy.intercept("GET", `${backendOrigin}/auth/me`, {
      statusCode: 401,
      body: { message: "Session token is required" },
    }).as("authMeGuest");

    cy.visit(`${frontendUrl()}/login`);
    cy.wait("@authMeGuest");
    cy.contains("Please log in").should("be.visible");
    cy.contains("button", "Log in").should("be.visible").and("not.be.disabled");
  });

  it("shows the logged-in user and logs out through the backend", () => {
    cy.intercept("GET", `${backendOrigin}/auth/me`, sampleUser).as("authMeUser");
    cy.intercept("POST", `${backendOrigin}/auth/logout`, {
      statusCode: 200,
      body: { message: "Logged out" },
    }).as("logout");

    cy.visit(`${frontendUrl()}/login`);
    cy.wait("@authMeUser");
    cy.contains(sampleUser.email).should("be.visible");
    cy.contains(`Hi, ${sampleUser.display_name}!`).should("be.visible");

    cy.contains("button", "Log out").click();
    cy.wait("@logout");
    cy.contains("Please log in").should("be.visible");
  });
});
