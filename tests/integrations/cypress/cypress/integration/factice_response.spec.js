/// <reference types="cypress" />

context('Network Requests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5000');
  });

  // Manage AJAX / XHR requests in your app
  it('use factice.request() to compare result from  fake api', () => {
    cy.intercept({ method: 'GET', url: '/plurals' }).as('plurals');
    const { response } = cy.factice.request({ resource: 'plurals' });
    cy.get('[data-cy=fetchPlurals]').click();
    cy.wait('@plurals');
    cy.get('#resultTarget').contains(response[0].text);
  });

  it('use factice.reply() to mock resource', () => {
    cy.intercept(
      { method: 'GET', url: /\/plurals\/(.)*/ },
      cy.factice.reply({ resource: 'plurals/:id', id: 'first' })
    ).as('plural');
    cy.get('[data-cy=fetchPlural]').click();
    cy.wait('@plural');
    cy.get('#resultTarget').contains('first');
  });
});
