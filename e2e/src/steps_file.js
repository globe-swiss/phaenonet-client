const { navbarComponent, individualsEditPage, individualsPage, mapPage, privateProfilePage } = inject();
const fetch = require('node-fetch');

// in this file you can append custom step methods to 'I' object

// eslint-disable-next-line func-names
module.exports = function () {
  return actor({
    async clearTestData() {
      this.say('clear individuals for e2e user');
      await fetch('https://europe-west1-phaenonet-test.cloudfunctions.net/e2e_clear_individuals');
    },
    ss() {
      this.saveScreenshot('debug.png', true);
    },
    login() {
      const { loginPage } = inject();
      this.visit(loginPage.url);
      this.amLoggedOut();
      this.enterLoginCredentials();
      this.click(loginPage.loginButton);
      this.waitUrlEquals(privateProfilePage.url);
      this.seeElement(privateProfilePage.components.profile);
    },
    enterLoginCredentials() {
      const { loginPage, e2eTestUser } = inject();
      this.waitUrlEquals(loginPage.url);
      this.fillField(loginPage.fields.email, e2eTestUser.email);
      this.fillField(loginPage.fields.password, e2eTestUser.password);
    },
    amLoggedIn() {
      this.see('Profil', navbarComponent.signinProfileButton); // fixme: better way to check if logged in
    },
    amLoggedOut() {
      this.see('Anmelden', navbarComponent.signinProfileButton); // fixme: better way to check if logged in
    },
    selectDropdownValue(dropdownLocator, value) {
      this.click(dropdownLocator);
      this.click({ css: `mat-option[ng-reflect-value='${value}']` });
    },
    async createDefaultIndividual() {
      // fixme: fails if api limit reached
      this.visit(individualsEditPage.newIndividualUrl);
      individualsEditPage.fillForm();
      this.click(individualsEditPage.saveButton);
      this.waitForElement(individualsPage.components.header, 10);
      const url = await this.grabCurrentUrl();
      this.say(`Created Individual at ${url}`);
      return url;
    },
    deleteIndividual(url) {
      this.visit(url);
      // delete all observations
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
