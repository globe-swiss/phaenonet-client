const { navbarComponent, individualsEditPage, individualsPage, mapPage } = inject();

// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({
    ss: function () {
      this.saveScreenshot('debug.png', true);
    },
    login: function () {
      const { loginPage, e2eTestUser } = inject();
      this.visit(loginPage.url);
      this.fillField(loginPage.fields.email, e2eTestUser.email);
      this.fillField(loginPage.fields.password, e2eTestUser.password);
      this.click(loginPage.loginButton);
      this.waitUrlEquals('/map');
      this.seeElement(mapPage.components.map);
    },
    amLoggedIn: function () {
      this.see('Profil', navbarComponent.registerProfileButton); // fixme: better way to check if logged in
    },
    amLoggedOut: function () {
      this.see('Anmelden', navbarComponent.registerProfileButton); // fixme: better way to check if logged in
    },
    selectDropdownValue(dropdownLocator, value) {
      this.click(dropdownLocator);
      this.click({ css: "mat-option[ng-reflect-value='" + value + "']" });
    },
    async createDefaultIndividual() {
      // fixme: fails if api limit reached
      this.visit(individualsEditPage.newIndividualUrl);
      individualsEditPage.fillForm();
      this.click(individualsEditPage.saveButton);
      this.waitForElement(individualsPage.components.header, 10);
      const url = await this.grabCurrentUrl();
      this.say('Created Individual at ' + url);
      return url;
    },
    deleteIndividual(url) {
      this.visit(url);
      //delete all observations
      individualsPage.deleteIndividual();
    },
    checkElementsPresent(elementList) {
      Object.values(elementList).forEach(el => {
        this.seeElement(el);
      });
    },
    visit(url) {
      this.amOnPage(url);
      this.wait(1); // make it slow but reliable
    },
    dismissMapPopup() {
      this.wait(3); // dismissbutton to appear, unsafe
      this.clickIfVisible(mapPage.dismissButton);
    }
  });
};
