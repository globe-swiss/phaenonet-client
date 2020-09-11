Feature('map');

Scenario('test map component present logged-out', (I, mapPage) => {
  I.amOnPage(mapPage.url);
  for (component of Object.values(mapPage.components)) {
    I.seeElement(component);
  }
  I.dontSeeElement(mapPage.addObjectButton);
});

Scenario('test map component present logged-in', (I, mapPage) => {
  I.login();
  I.amOnPage(mapPage.url);
  for (component of Object.values(mapPage.components)) {
    I.seeElement(component);
  }
  I.seeElement(mapPage.addObjectButton);
});

Scenario('test initial filter', (I, mapPage) => {
  I.amOnPage(mapPage.url);
  I.waitForText('Alle', mapPage.filterFields.source);
  I.waitForText('Alle', mapPage.filterFields.species);
  I.waitForText('2020', 2, mapPage.filterFields.phenoyear);
});

Scenario('test add object navigation', async (I, mapPage, individualsEditPage) => {
  I.login();
  I.amOnPage(mapPage.url);
  I.click(mapPage.addObjectButton);
  I.waitUrlEquals(individualsEditPage.newIndividualUrl);
});
