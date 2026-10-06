const backendUrl = () => Cypress.env("BACKEND_URL") as string;

describe("pj-backend public API", () => {
  it("responds on the root endpoint", () => {
    cy.request(`${backendUrl()}/`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({
        message: "Indoor Navigation Backend is running",
      });
    });
  });

  it("returns database health information", () => {
    cy.request(`${backendUrl()}/health/database`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body.message).to.equal("Database connection is working");
      expect(res.body.tableCounts).to.include.all.keys(
        "buildings",
        "floors",
        "places",
        "users",
        "favorites",
        "reviews",
        "reviewLikes",
        "reports",
      );
    });
  });

  it("lists buildings, floors, places, and place types", () => {
    cy.request(`${backendUrl()}/buildings`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
    });

    cy.request(`${backendUrl()}/floors`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
    });

    cy.request(`${backendUrl()}/places`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
    });

    cy.request(`${backendUrl()}/places/types`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
    });
  });

  it("filters places by floor and search term", () => {
    cy.request(`${backendUrl()}/places?floor=4`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
      res.body.forEach((place: any) => {
        expect(place.floor_number).to.equal(4);
      });
    });

    cy.request(`${backendUrl()}/places?search=room`).then((res) => {
      expect(res.status).to.equal(200);
      expect(res.body).to.be.a("array");
    });
  });

  it("validates malformed query and route parameters", () => {
    cy.request({
      url: `${backendUrl()}/places?floor=not-a-number`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("floor must be an integer");
    });

    cy.request({
      url: `${backendUrl()}/places/not-a-uuid`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(400);
      expect(res.body.message).to.equal("place_id must be a valid UUID");
    });
  });

  it("protects developer-only writes from guests", () => {
    cy.request({
      method: "POST",
      url: `${backendUrl()}/buildings`,
      body: { building_name: `Cypress ${Date.now()}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.equal(401);
      expect(res.body.message).to.equal("Session token is required");
    });
  });
});
