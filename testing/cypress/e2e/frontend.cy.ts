const frontendUrl = () => Cypress.env("FRONTEND_URL") as string;

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

const stubFrontendApi = () => {
  cy.intercept("GET", "http://localhost:3000/places/types", [
    "CLASSROOM",
    "LAB",
    "OFFICE",
  ]).as("placeTypes");

  cy.intercept("GET", "http://localhost:3000/places?place_type=CLASSROOM", [
    samplePlace,
  ]).as("placesByType");

  cy.intercept("GET", `http://localhost:3000/places/${samplePlace.place_id}`, {
    ...samplePlace,
  }).as("placeDetail");
};

describe("pj-frontend", () => {
  beforeEach(() => {
    stubFrontendApi();
  });

  it("renders the default floor map", () => {
    cy.visit(frontendUrl());
    cy.contains("Dashboard").should("be.visible");
    cy.get("input[placeholder='Search location here']").should("be.visible");
    cy.get("img[alt='Floor 4 Map']").should("be.visible");
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
    cy.contains("Descriptions").should("be.visible");
  });

  it("opens room details from a floor hotspot", () => {
    cy.visit(frontendUrl());
    cy.get("div[style*='66.5%'][style*='18%']").first().click({ force: true });
    cy.wait("@placeDetail");
    cy.contains("Room 413A").should("be.visible");
    cy.contains("A test classroom returned by Cypress.").should("be.visible");
  });
});
