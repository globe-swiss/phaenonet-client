Feature('Individual Ranger View');

// fixme: fails if api limit reached
Before(async ({ I, individualsPage, e2eRangerUser }) => {
  await I.clearTestData();
  I.mockGooglemaps();
  I.login(e2eRangerUser);
  const individualId = await I.createDefaultIndividual();
  I.visit(individualsPage, individualsPage.url(individualId));
});

Scenario('test individual details', async ({ I, e2eRangerUser, individualsPage }) => {
  I.see('Hasel', individualsPage.description.species);
  I.see('e2e-test-obj', individualsPage.description.name);
  I.see(e2eRangerUser.nickname, individualsPage.description.owner);

  I.see('Stadt', individualsPage.description.descriptionFields.environment);
  I.see('1504', individualsPage.description.descriptionFields.altitude);
  I.see('Nord', individualsPage.description.descriptionFields.exposition);
  I.see('42', individualsPage.description.descriptionFields.gradient);
  I.see('beschattet', individualsPage.description.descriptionFields.shadow);
  I.see('bewässert', individualsPage.description.descriptionFields.watering);
  I.see('mehr als 100m', individualsPage.description.descriptionFields.distance);
  I.see('Wald', individualsPage.description.descriptionFields.habitat);
  I.see('Mischwald', individualsPage.description.descriptionFields.forestType);

  await I.checkVisual('individual_view-ranger_details');
})
  .tag('@visual')
  .tag('@ranger');
