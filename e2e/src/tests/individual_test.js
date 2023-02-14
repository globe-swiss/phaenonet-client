Feature('Individual View');

Before(async ({ I }) => {
  await I.clearTestData();
  I.mockGooglemaps();
  I.login();
});

Scenario('test delete individual', async ({ I, individualsPage, privateProfilePage }) => {
  const individualId = await I.createDefaultIndividual();
  I.visit(individualsPage, individualsPage.url(individualId));
  I.scrollTo(individualsPage.deleteButton);
  I.click(individualsPage.deleteButton);
  I.waitForVisible(individualsPage.deleteDialog.deleteConfirmationButton);
  await I.checkVisual('individual_view-delete_dialog', 0, false, { retries: 3, wait: 1 });
  I.click(individualsPage.deleteDialog.deleteConfirmationButton);
  I.waitForComponents(privateProfilePage.components);
}).tag('visual');

Scenario('test individual details', async ({ I, individualsPage, e2eTestUser }) => {
  const individualId = await I.createDefaultIndividual();
  I.visit(individualsPage, individualsPage.url(individualId));
  I.see('Hasel', individualsPage.description.species);
  I.see('e2e-test-obj', individualsPage.description.name);
  I.see(e2eTestUser.nickname, individualsPage.description.owner);

  I.see('Stadt', individualsPage.description.descriptionFields.environment);
  I.see('1504', individualsPage.description.descriptionFields.altitude);
  I.see('Nord', individualsPage.description.descriptionFields.exposition);
  I.see('42', individualsPage.description.descriptionFields.gradient);
  I.see('beschattet', individualsPage.description.descriptionFields.shadow);
  I.see('bewässert', individualsPage.description.descriptionFields.watering);
  I.see('mehr als 100m', individualsPage.description.descriptionFields.distance);
  I.see('Wald', individualsPage.description.descriptionFields.habitat);
  I.see('Mischwald', individualsPage.description.descriptionFields.forestType);

  await I.checkVisual('individual_view-details');
}).tag('visual');

Scenario('test edit individual button', async ({ I, individualsPage, individualsEditPage }) => {
  const individualId = await I.createDefaultIndividual();
  I.visit(individualsPage, individualsPage.url(individualId));
  I.click(individualsPage.editButton);
  I.waitUrlEquals(individualsEditPage.url(individualId));
});

Scenario('test subscribe to individual', ({ I, individualsPage }) => {
  I.visit(individualsPage, individualsPage.url('2018_1326'));
  I.waitForElement(individualsPage.followButton);
  I.click(individualsPage.followButton);
  I.waitForElement(individualsPage.unfollowButton);
  I.click(individualsPage.unfollowButton);
  I.waitForElement(individualsPage.followButton);
});

Scenario('test individual with image', async ({ I, individualsPage }) => {
  I.visit(individualsPage, individualsPage.url('2018_1326'));
  await I.checkVisual('individual_test-image', 0, false, { retries: 5, wait: 0.5 });
}).tag('visual');

Scenario.todo('test individual with sensor', () => {
  // check switching between views
  // check timeseries toggles
  // check display of sensor data
}).tag('visual');
