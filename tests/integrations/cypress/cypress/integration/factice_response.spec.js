/// <reference types="cypress" />

import sourceDb from '../../sample-db.json';
import factice from 'factice/plugins/cypress';

context('Network Requests', () => {
  beforeEach(() => {
    factice.init({ data: sourceDb });
    cy.visit('http://localhost:5000');
    cy.server();
  });

  // Manage AJAX / XHR requests in your app
  it('use factice.response() to stub xhr with factice plural content', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals',
      ...factice.response({ resource: 'plurals' }),
    });

    cy.get('[data-cy=fetchPlurals]').click();
  });

  it('use factice.response() with id', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals/*',
      ...factice.response({ resource: 'plurals/:id', id: 'second' }),
    });
  });

  it('use factice.response() with query parameters', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals',
      ...factice.response({
        resource: 'plurals',
        query: { sort: 'price', order: 'ASC', page: 1 },
      }),
    });

    cy.get('[data-cy=fetchPlurals]').click();
  });

  it('use factice.response() with pagination headers', () => {
    cy.route({
      method: 'GET',
      url: '*/plurals',
      ...factice.response({ resource: 'plurals', query: { page: 1 } }),
    });

    cy.get('[data-cy=fetchPlurals]').click();
  });
});
