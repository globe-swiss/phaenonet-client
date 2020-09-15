Feature('Login');

Scenario('test login component present', (I, loginPage) => {
  I.login();
  I.amOnPage(loginPage.url);
  for (component of Object.values(loginPage.components)) {
    I.seeElement(component);
  }
});

Scenario('test login from home screen', (I, loginPage, mapPage, e2eTestUser, navbarComponent) => {
  I.amOnPage('/');
  I.click(navbarComponent.registerProfileButton);

  loginPage.login(e2eTestUser.email, e2eTestUser.password);
  I.seeElement(mapPage.components.map);
  I.waitUrlEquals(mapPage.url);
  I.amLoggedIn();
});

Scenario('test login failure', (I, loginPage, e2eTestUser) => {
  I.amOnPage(loginPage.url);
  loginPage.login(e2eTestUser.email, 'wrong');
  I.waitForText('Anmeldung fehlgeschlagen');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});
