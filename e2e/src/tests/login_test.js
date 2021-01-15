Feature('Login').retry(2);

Scenario('test login component present', ({ I, loginPage }) => {
  I.visit(loginPage.url);
  I.checkElementsPresent(loginPage.components);
});

Scenario('test login from home screen', ({ I, loginPage, mapPage, e2eTestUser, navbarComponent }) => {
  I.visit('/');
  I.click(navbarComponent.registerProfileButton);

  loginPage.login(e2eTestUser.email, e2eTestUser.password);
  I.seeElement(mapPage.components.map);
  I.waitUrlEquals(mapPage.url);
  I.seeElement(mapPage.components.map);
  I.amLoggedIn();
});

Scenario('test login failure', ({ I, loginPage, e2eTestUser }) => {
  I.visit(loginPage.url);
  loginPage.login(e2eTestUser.email, 'wrong');
  I.waitForText('Anmeldung fehlgeschlagen');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});
