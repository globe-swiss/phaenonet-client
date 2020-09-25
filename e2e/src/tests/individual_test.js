Feature('Individual View');

var individualUrl;

// fixme: fails if api limit reached
Before(async I => {
  I.login();
  individualUrl = await I.createDefaultIndividual();
  I.visit(individualUrl);
});

After(I => {
  I.deleteIndividual(individualUrl);
});

Scenario('test create/delete individual', () => {});

Scenario('test individual details', (I, individualsPage, e2eTestUser) => {
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
});

Scenario('test edit individual button', (I, individualsPage) => {
  I.click(individualsPage.description.editButton);
  I.waitUrlEquals(individualUrl + '/edit');
});
