Feature('Private Profile');

Scenario('test component present', (I, privateProfilePage) => {
  I.login();
  I.amOnPage(privateProfilePage.url);
  for (component of Object.values(privateProfilePage.components)) {
    I.seeElement(component);
  }
});

Scenario('profile values', (I, privateProfilePage, e2eTestUser) => {
  I.login();
  I.amOnPage(privateProfilePage.url);
  I.see(e2eTestUser.nickname, privateProfilePage.nickname);
  I.see(e2eTestUser.name, privateProfilePage.name);
  I.see(e2eTestUser.surname, privateProfilePage.surname);
  I.see(e2eTestUser.email, privateProfilePage.email);
  I.see(e2eTestUser.language, privateProfilePage.language);
});

Scenario('test profile buttons', (I, privateProfilePage) => {
  I.login();
  I.amOnPage(privateProfilePage.url);

  I.seeElement(privateProfilePage.profile.profileLinkButton);
  I.seeElement(privateProfilePage.profile.logoutButton);
  I.seeElement(privateProfilePage.profile.profileEditButton);
});

Scenario('test logout', (I, privateProfilePage) => {
  I.login();
  I.amOnPage(privateProfilePage.url);

  I.amLoggedIn();
  I.click(privateProfilePage.profile.logoutButton);
  I.amLoggedOut();
});

Scenario('test edit profile link', (I, privateProfilePage, profileEditPage, e2eTestUser) => {
  I.login(); // uses e2eTestUser
  I.amOnPage(privateProfilePage.url);

  I.click(privateProfilePage.profile.profileEditButton);
  I.waitUrlEquals(profileEditPage.url(e2eTestUser));
});
