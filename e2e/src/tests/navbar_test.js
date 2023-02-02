Feature('Navigation Bar');

Scenario('test navbar content present', ({ I, navbarComponent }) => {
  I.amOnPage('/');
  I.waitForComponents(navbarComponent);
});

Scenario('test register/profile', async ({ I, navbarComponent, e2eTestUser }) => {
  I.amOnPage(`/profile/${e2eTestUser.id}`);
  I.see('Anmelden', navbarComponent.signinProfileButton);
  await I.checkVisual('navigation_bar-pre-login');
  I.login();
  I.see('Profil', navbarComponent.signinProfileButton);
  await I.checkVisual('navigation_bar-post-login');
}).tag('@visual');
