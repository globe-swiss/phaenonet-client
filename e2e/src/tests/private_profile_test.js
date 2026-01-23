Feature('Private Profile');

const pf = 'private_profile';

Scenario('profile values', async ({ I, privateProfilePage, e2eTestUser }) => {
  I.login();
  I.visit(privateProfilePage);
  I.waitForText(e2eTestUser.nickname);
  await I.checkVisual(`${pf}-profile_values`, 0.01); // ng20 minor diff - reset tolerance when updating base image
}).tag('visual');

Scenario('test logout', async ({ I, privateProfilePage, logoutPage }) => {
  I.login();
  I.visit(privateProfilePage);

  I.amLoggedIn();
  I.click(privateProfilePage.profile.logoutButton);
  I.waitForComponents(logoutPage.components);
  I.amLoggedOut();
  await I.checkVisual('private_profile-loggedout');
}).tag('visual');

Scenario('test edit profile link', ({ I, privateProfilePage, profileEditPage, e2eTestUser }) => {
  I.login(); // uses e2eTestUser
  I.visit(privateProfilePage);

  I.click(privateProfilePage.profile.profileEditButton);
  I.waitUrlEquals(profileEditPage.url(e2eTestUser));
});

Scenario('test new individual shown on profile', async ({ I, privateProfilePage }) => {
  await I.clearTestData();
  I.login();
  I.visit(privateProfilePage);
  I.say('Checking that the profile is clean');
  I.dontSeeElement(privateProfilePage.observations.listItems);

  await I.createDefaultIndividual();
  I.visit(privateProfilePage);
  I.waitForElement(privateProfilePage.observations.listItems);
  await I.checkVisual(`${pf}-new_individual`, 0.01); // ng20 minor diff - reset tolerance when updating base image
}).tag('visual');

Scenario('test loggedout profile access', ({ I, privateProfilePage, loginPage }) => {
  I.amOnPage(privateProfilePage.url);
  I.waitForComponents(loginPage.components);
  I.amLoggedOut();
});

Scenario.todo('test activities', () => {
  // check activities present and clickable
});
