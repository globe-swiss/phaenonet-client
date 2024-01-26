Feature('Navigation Bar');

Scenario('test navbar content present', ({ I, navbarComponent }) => {
  I.amOnPage('/');
  I.waitForComponents(navbarComponent);
});

Scenario.todo('test register/profile', async ({ I, navbarComponent, e2eTestUser, privateProfilePage }) => {
  // DISABLED: rework this test when it is possible to check components/parts of the webpage visually with resemble
  I.amOnPage(`/profile/${e2eTestUser.id}`);
  I.waitForText('Anmelden', 10, navbarComponent.signinProfileButton);
  await I.checkVisual('navigation_bar-pre-login');
  I.login();
  I.waitForText('Profil', 10, navbarComponent.signinProfileButton);
  I.waitForComponents(privateProfilePage.components);
  await I.checkVisual('navigation_bar-post-login');
}).tag('visual');
