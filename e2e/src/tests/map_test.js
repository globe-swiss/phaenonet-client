Feature('Map');

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
  I.waitForText('Alle', mapPage.filter.source.dropdown);
  I.waitForText('Alle', mapPage.filter.species.dropdown);
  I.waitForText('2020', 2, mapPage.filter.phenoyear.dropdown);
});

Scenario('test add object navigation', async (I, mapPage, individualsEditPage) => {
  I.login();
  I.amOnPage(mapPage.url);
  I.click(mapPage.addObjectButton);
  I.waitUrlEquals(individualsEditPage.newIndividualUrl);
});

Scenario('test map markers for 2018', async (I, mapPage) => {
  mapPage.visit();
  mapPage.filter.phenoyear.select(2018);
  I.seeNumberOfElements(mapPage.mapMarker, 378); // 2018, all, all
  mapPage.filter.source.select(mapPage.filter.source.options.phenonet);
  I.seeNumberOfElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  mapPage.filter.source.select(mapPage.filter.source.options.meteoswiss);
  I.seeNumberOfElements(mapPage.mapMarker, 147); // 2018, meteoswiss, all
  mapPage.filter.species.select(mapPage.filter.species.options.sycamore);
  I.seeNumberOfElements(mapPage.mapMarker, 147); // 2018, meteoswiss, sycamore
  mapPage.filter.source.select(mapPage.filter.source.options.phenonet);
  I.seeNumberOfElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  mapPage.filter.source.select(mapPage.filter.source.options.all);
  // fixme -> this is a bug and should return approx 177 results
  //I.seeNumberOfElements(mapPage.mapMarker, 177); // 2011, all, sycamore
});
