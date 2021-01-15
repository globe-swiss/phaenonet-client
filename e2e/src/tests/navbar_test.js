Feature('Navigation Bar Component').retry(2);

Scenario('test navbar content present', ({ I, navbarComponent }) => {
  I.visit('/');
  I.checkElementsPresent(navbarComponent);
});

Scenario('test register/profile', ({ I, navbarComponent }) => {
  I.visit('/');
  I.see('Anmelden', navbarComponent.registerProfileButton);
  I.login();
  I.see('Profil', navbarComponent.registerProfileButton);
});
