before(() => {
  const url = Cypress.expose("BACKEND_URL");
  cy.request({
    method: "POST",
    url: `${url}/todo/all`,
  });
});

describe("Frontend", () => {
  it("connects", () => {
    const url = Cypress.expose("FRONTEND_URL");
    cy.visit(url);
  });
  it("creates todo", () => {
    const url = Cypress.expose("FRONTEND_URL");
    const text = new Date().getTime().toString();
    cy.visit(url);
    cy.get("[data-cy='input-text']").type(text);
    cy.get("[data-cy='submit']").click();
    cy.contains(text);
  });

  it("deletes todo", () => {
    const url = Cypress.expose("FRONTEND_URL");

    const text = new Date().getTime().toString();
    cy.visit(url);
    cy.get("[data-cy='input-text']").type(text);
    cy.get("[data-cy='submit']").click();
    cy.get("[data-cy='todo-item-wrapper']")
      .contains(text)
      .parent()
      .within(() => {
        cy.get("[data-cy='todo-item-delete']").click();
      });
    cy.contains(text).should("not.exist");
  });

  it("updates todo", () => {
    const url = Cypress.expose("FRONTEND_URL");

    const text = new Date().getTime().toString();
    const textUpdated = "123456";
    cy.visit(url);
    cy.get("[data-cy='input-text']").type(text);
    cy.get("[data-cy='submit']").click();
    cy.get("[data-cy='todo-item-wrapper']")
      .contains(text)
      .parent()
      .within(() => {
        cy.get("[data-cy='todo-item-update']").click();
      });
    cy.get("[data-cy='input-text']").clear().type(textUpdated);
    cy.get("[data-cy='submit']").click();
    cy.contains(textUpdated);
    cy.contains(text).should("not.exist");
  });
});
