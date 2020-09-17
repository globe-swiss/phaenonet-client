Feature('Map');

Scenario('test map component present logged-out', (I, mapPage) => {
  I.amOnPage(mapPage.url);
  for (let component of Object.values(mapPage.components)) {
    I.seeElement(component);
  }
  I.dontSeeElement(mapPage.addObjectButton);
});

Scenario('test map component present logged-in', (I, mapPage) => {
  I.login();
  I.amOnPage(mapPage.url);
  for (let component of Object.values(mapPage.components)) {
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
  // fixme: fails if no api key (or limit exceeded)
  // pssible solution https://github.com/codeceptjs/CodeceptJS/issues/648#issuecomment-368607630
  mapPage.visit();
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018);
  I.seeNumberOfElements(mapPage.mapMarker, 378); // 2018, all, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.seeNumberOfElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.meteoswiss);
  I.seeNumberOfElements(mapPage.mapMarker, 147); // 2018, meteoswiss, all
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.options.sycamore);
  I.seeNumberOfElements(mapPage.mapMarker, 147); // 2018, meteoswiss, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.seeNumberOfElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.all);
  // fixme -> this is a bug and should return approx 177 results
  //I.seeNumberOfElements(mapPage.mapMarker, 177); // 2011, all, sycamore
});
