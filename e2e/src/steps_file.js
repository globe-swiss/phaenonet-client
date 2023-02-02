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
      this.amOnPage(loginPage.url);
      this.amLoggedOut();
      this.enterLoginCredentials();
      this.click(loginPage.loginButton);
      this.waitUrlEquals(privateProfilePage.url);
      this.waitForElement(privateProfilePage.components.profile);
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
    selectDropdownValue(dropdownLocator, value, delay = 0) {
      this.click(dropdownLocator);
      this.click({ css: `mat-option[ng-reflect-value='${value}']` });
      this.wait(delay);
    },
    async createDefaultIndividual() {
      // fixme: fails if api limit reached
      this.visit(individualsEditPage, individualsEditPage.newIndividualUrl);
      this.waitForElement(individualsEditPage.components.form);
      individualsEditPage.fillForm();
      this.click(individualsEditPage.saveButton);
      this.waitForElement(individualsPage.components.header, 10);
      const url = await this.grabCurrentUrl();
      this.say(`Created Individual at ${url}`);
      return url.split('/').pop();
    },
    deleteIndividual(url) {
      this.visit(individualsPage, url);
      // delete all observations
      individualsPage.deleteIndividual();
    },
    waitForComponents(componentList) {
      Object.values(componentList).forEach(el => {
        this.waitForElement(el, 5);
      });
    },
    waitForDropdown(locator, delay = 5) {
      const locatorString = `${locator.css ? locator.css : locator} .mat-select-placeholder`;
      this.waitForInvisible(locatorString, delay);
    },
    visit(page, url = null, components = null) {
      this.amOnPage(url || page.url);
      this.waitForComponents(components || page.components || []);
    },
    dismissMapPopup() {
      this.wait(3); // dismissbutton to appear, unsafe
      this.clickIfVisible(mapPage.dismissButton);
    },
    async checkVisual(filename, tolerance = 0, prepareBaseImage = false, retryParams = { retries: 0, wait: 0 }) {
      await retryTo(() => {
        this.wait(retryParams.wait);
        this.saveScreenshot(`${filename}.png`, true);
        this.seeVisualDiff(`${filename}.png`, {
          tolerance,
          prepareBaseImage,
          outputSettings: {
            ignoreAreasColoredWith: { r: 255, g: 0, b: 0, a: 255 }
          }
        });
      }, retryParams.retries);
    },
    mockGooglemaps() {
      // https://developers.google.com/maps/domains
      this.mockRoute('https://khm*.googleapis.com/**', route => route.abort());
      this.mockRoute('https://maps.googleapis.com/maps/**', route => route.abort());
      this.mockRoute('https://maps.googleapis.com/maps/api/js?*', route => route.continue());
    }
  });
};
