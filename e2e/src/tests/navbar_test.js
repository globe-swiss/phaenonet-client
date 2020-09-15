Feature('Navigation Bar Component');

Scenario('test navbar content present', (I, navbarComponent) => {
  I.amOnPage('/');
  for (component of Object.values(navbarComponent)) {
    I.seeElement(component);
  }
});

Scenario('test register/profile', (I, navbarComponent) => {
  I.amOnPage('/');
  I.see('Anmelden', navbarComponent.registerProfileButton);
  I.login();
  I.see('Profil', navbarComponent.registerProfileButton);
});
