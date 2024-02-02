const { navbarComponent, individualsEditPage, individualsPage, privateProfilePage } = inject();
const fetch = require('node-fetch');
const { retrySteps } = require('./helpers/retrySteps');

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
    selectDropdownValue(dropdownLocator, value, delay = 0) {
      this.click(dropdownLocator);
      // option might no be present if role check is still pending
      this.retry().click({ css: `mat-option[ng-reflect-value='${value}']` });
      this.wait(delay);
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
      const locatorString = `${locator.css ? locator.css : locator} .mat-select-placeholder`;
      this.waitForInvisible(locatorString, delay);
    },
    visit(page, url = null, components = null) {
      this.amOnPage(url || page.url);
      this.waitForComponents(components || page.components || []);
    },
    async checkVisual(filename, tolerance = 0, prepareBaseImage = false, retryParams = { retries: 3, wait: 0.2 }) {
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
