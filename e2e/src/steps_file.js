// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({
    ss: function () {
      this.saveScreenshot('debug.png', true);
    },
    login: function () {
      const { loginPage, e2eTestUser } = inject();
      this.amOnPage(loginPage.url);
      this.fillField(loginPage.fields.email, e2eTestUser.email);
      this.fillField(loginPage.fields.password, e2eTestUser.password);
      this.click(loginPage.loginButton);
      this.waitUrlEquals('/map', 5);
    },
    amLoggedIn: function () {
      const { navbarComponent } = inject();
      this.see('Profil', navbarComponent.registerProfileButton); // fixme: better way to check if logged in
    },
    amLoggedOut: function () {
      const { navbarComponent } = inject();
      this.see('Anmelden', navbarComponent.registerProfileButton); // fixme: better way to check if logged in
    },
    selectDropdownValue(dropdownLocator, value) {
      this.click(dropdownLocator);
      this.click({ css: "mat-option[ng-reflect-value='" + value + "']" });
    }
  });
};
