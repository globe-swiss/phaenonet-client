Feature('Login').retry(2);

Scenario('test login component present', ({ I, loginPage }) => {
  I.visit(loginPage.url);
  I.checkElementsPresent(loginPage.components);
});

Scenario('test login from home screen', ({ I, loginPage, privateProfilePage, e2eTestUser, navbarComponent }) => {
  I.visit('/');
  I.amLoggedOut();
  I.click(navbarComponent.signinProfileButton);

  loginPage.login(e2eTestUser.email, e2eTestUser.password);
  I.waitUrlEquals(privateProfilePage.url);
  I.seeElement(privateProfilePage.components.profile);
  I.amLoggedIn();
});

Scenario('test login failure', ({ I, loginPage, e2eTestUser }) => {
  I.visit(loginPage.url);
  loginPage.login(e2eTestUser.email, 'wrong');
  I.waitForText('Anmeldung fehlgeschlagen');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});

Scenario('test login with invalid mail', ({ I, loginPage, e2eTestUser }) => {
  I.visit(loginPage.url);
  loginPage.login('invalid_email', 'doesnt_matter');
  I.waitForText('Ungültige Mailadresse');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});
