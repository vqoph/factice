/// <reference types="cypress" />

context('Network Requests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:5000');
  });

  // Manage AJAX / XHR requests in your app
  it('use factice.request() to compare result from  fake api', () => {
    const { response } = cy.factice.request({ resource: 'plurals' });
    cy.intercept({ method: 'GET', url: '/plurals' }).as('plurals');
    cy.get('[data-cy=fetchPlurals]').click();
    cy.wait('@plurals');
    cy.get('#resultTarget').contains(response[0].text);
  });

  it('use factice.handle() to mock resource', () => {
    cy.intercept(
      { method: 'GET', url: /\/plurals\/(.)*/ },
      cy.factice.handler({ resource: 'plurals/:id', id: 'first' })
    ).as('plural');
    cy.get('[data-cy=fetchPlural]').click();
    cy.wait('@plural');
    cy.get('#resultTarget').contains('first');
  });

  xit('use factice.get() with query parameters', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals',
      ...cy.factice.get({
        resource: 'plurals',
        query: { sort: 'price', order: 'ASC', page: 1 },
      }),
    });

    cy.get('[data-cy=fetchPlurals]').click();
  });

  xit('use factice.get() with pagination headers', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals',
      ...cy.factice.get({ resource: 'plurals', query: { page: 1 } }),
    });

    cy.get('[data-cy=fetchPlurals]').click();
  });
});
