describe("testing setup", () => {
  it("loads configured project URLs", () => {
    expect(Cypress.env("BACKEND_URL")).to.be.a("string").and.not.be.empty;
    expect(Cypress.env("FRONTEND_URL")).to.be.a("string").and.not.be.empty;
  });
});
