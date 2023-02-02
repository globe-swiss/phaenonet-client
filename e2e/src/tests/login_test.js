Feature('Login');

Scenario('test login screen', async ({ I, loginPage }) => {
  I.visit(loginPage);
  I.waitForText('E-Mail');
  await I.checkVisual('login', 0, false, { retries: 3, wait: 0.2 });
}).tag('@visual');

Scenario('test login from home screen', ({ I, loginPage, privateProfilePage, e2eTestUser, navbarComponent }) => {
  I.amOnPage('/');
  I.amLoggedOut();
  I.click(navbarComponent.signinProfileButton);

  loginPage.login(e2eTestUser.email, e2eTestUser.password);
  I.waitUrlEquals(privateProfilePage.url);
  I.waitForElement(privateProfilePage.components.profile);
  I.amLoggedIn();
});

Scenario('test login failure', ({ I, loginPage, e2eTestUser }) => {
  I.visit(loginPage);
  loginPage.login(e2eTestUser.email, 'wrong');
  I.waitForText('Anmeldung fehlgeschlagen');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});

Scenario('test login with invalid mail', ({ I, loginPage }) => {
  I.visit(loginPage);
  loginPage.login('invalid_email', 'doesnt_matter');
  I.waitForText('Ungültige Mailadresse');
  I.waitUrlEquals(loginPage.url);
  I.amLoggedOut();
});
