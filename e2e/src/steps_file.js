const { navbarComponent, individualsEditPage, individualsPage, privateProfilePage } = inject();
const fetch = require('node-fetch');
const { retrySteps } = require('./helpers/retrySteps');

const prepareBaseImage = false;

// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({
    async clearTestData() {
      this.say('clear individuals for e2e user');
      await fetch('https://europe-west1-phaenonet-test.cloudfunctions.net/e2e_clear_individuals');
    },
    ss(suffix = '') {
      this.saveScreenshot(`debug${suffix}.png`, true);
    },
    login(user) {
      const { loginPage } = inject();
      this.visit(loginPage);
      this.amLoggedOut();
      this.enterLoginCredentials(user);
      this.click(loginPage.loginButton);
      this.waitUrlEquals(privateProfilePage.url);
    },
    enterLoginCredentials(user) {
      const { loginPage, e2eTestUser } = inject();
      const testUser = user || e2eTestUser;
      this.fillField(loginPage.fields.email, testUser.email);
      this.fillField(loginPage.fields.password, testUser.password);
    },
    amLoggedIn() {
      this.see('Profil', navbarComponent.signinProfileButton); // fixme: better way to check if logged in
    },
    amLoggedOut() {
      this.see('Anmelden', navbarComponent.signinProfileButton); // fixme: better way to check if logged in
    },
    selectDropdownValue(dropdownLocator, value, waitForDropdownValues = false) {
      if (waitForDropdownValues) {
        this.waitForDropdown(dropdownLocator);
      }
      this.click(dropdownLocator);
      const optionLocator = { css: `mat-option[ng-reflect-value='${value}']` };
      this.waitForElement(optionLocator); // option might no be present if role check is still pending
      this.click(optionLocator);
    },
    async createDefaultIndividual(species = undefined) {
      this.visit(individualsEditPage, individualsEditPage.newIndividualUrl);
      individualsEditPage.fillForm(species);
      this.click(individualsEditPage.saveButton);
      this.waitForElement(individualsPage.components.header, 10);
      const url = await this.grabCurrentUrl();
      this.say(`Created Individual at ${url}`);
      return url.split('/').pop();
    },
    waitForComponents(componentList) {
      Object.values(componentList).forEach(el => {
        this.waitForElement(el, 5);
      });
    },
    waitForDropdown(locator, delay = 5) {
      const locatorString = `${locator.css ? locator.css : locator} .mat-mdc-select-placeholder`;
      this.waitForInvisible(locatorString, delay);
    },
    visit(page, url = null, components = null) {
      this.amOnPage(url || page.url);
      this.waitForComponents(components || page.components || []);
    },
    async checkVisual(filename, tolerance = 0, retryParams = { retries: 3, wait: 0.5 }) {
      if (prepareBaseImage) {
        this.wait(5);
      }
      await retrySteps(
        this,
        I => {
          I.saveScreenshot(`${filename}.png`, true);
          I.seeVisualDiff(`${filename}.png`, {
            tolerance,
            prepareBaseImage,
            outputSettings: {
              ignoreAreasColoredWith: { r: 255, g: 0, b: 0, a: 255 }
            }
          });
        },
        retryParams.retries,
        retryParams.wait * 1000
      );
    },
    mockGooglemaps() {
      // https://developers.google.com/maps/domains
      this.mockRoute('https://khm*.googleapis.com/**', route => route.abort());
      this.mockRoute('https://maps.googleapis.com/maps/**', route => route.abort());
      this.mockRoute('https://maps.googleapis.com/maps/api/js?*', route => route.continue());
    }
  });
};
