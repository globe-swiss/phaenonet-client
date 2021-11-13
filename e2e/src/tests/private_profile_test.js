Feature('Private Profile');

Scenario('test component present', ({ I, privateProfilePage }) => {
  I.login();
  I.visit(privateProfilePage.url);
  I.checkElementsPresent(privateProfilePage.components);
});

Scenario('profile values', ({ I, privateProfilePage, e2eTestUser }) => {
  I.login();
  I.visit(privateProfilePage.url);
  I.see(e2eTestUser.nickname, privateProfilePage.profile.nickname);
  I.see(e2eTestUser.name, privateProfilePage.profile.name);
  I.see(e2eTestUser.surname, privateProfilePage.profile.surname);
  I.see(e2eTestUser.email, privateProfilePage.profile.email);
  I.see(e2eTestUser.language, privateProfilePage.profile.language);
});

Scenario('test profile buttons', ({ I, privateProfilePage }) => {
  I.login();
  I.visit(privateProfilePage.url);

  I.seeElement(privateProfilePage.profile.profileLinkButton);
  I.seeElement(privateProfilePage.profile.logoutButton);
  I.seeElement(privateProfilePage.profile.profileEditButton);
});

Scenario('test logout', ({ I, privateProfilePage, loginPage }) => {
  I.login();
  I.visit(privateProfilePage.url);

  I.amLoggedIn();
  I.click(privateProfilePage.profile.logoutButton);
  I.waitUrlEquals(loginPage.logoutUrl);
  I.amLoggedOut();
});

Scenario('test edit profile link', ({ I, privateProfilePage, profileEditPage, e2eTestUser }) => {
  I.login(); // uses e2eTestUser
  I.visit(privateProfilePage.url);

  I.click(privateProfilePage.profile.profileEditButton);
  I.waitUrlEquals(profileEditPage.url(e2eTestUser));
});

Scenario('test new individual shown on profile', async ({ I, privateProfilePage }) => {
  await I.clearTestData();

  I.login();
  I.visit(privateProfilePage.url);
  I.wait(2);
  I.say('Checking that the profile is clean');
  I.dontSeeElement(privateProfilePage.observations.listItems);

  const individualUrl = await I.createDefaultIndividual();
  I.visit(privateProfilePage.url);
  I.waitForElement(privateProfilePage.observations.listItems);
  within(privateProfilePage.observations.getItem(1), () => {
    I.seeElement(privateProfilePage.observations.withinItem.image);
    I.see('Hasel', privateProfilePage.observations.withinItem.species);
    I.see('e2e-test-obj', privateProfilePage.observations.withinItem.name);
  });
  I.deleteIndividual(individualUrl);
});

Scenario('test loggedout profile access', ({ I, privateProfilePage, loginPage, e2eTestUser }) => {
  I.visit(privateProfilePage.url);
  I.amLoggedOut();
  I.waitUrlEquals(loginPage.url);
  I.enterLoginCredentials();
  I.click(loginPage.loginButton);
  I.waitUrlEquals(privateProfilePage.url); // test redirect
  I.amLoggedIn();
  I.see(e2eTestUser.nickname, privateProfilePage.profile.nickname);
});

// missing tests
// - activities
