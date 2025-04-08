describe('Sample Test', () => {
  it('Visits the app root url', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Welcome').should('exist');
  });
});