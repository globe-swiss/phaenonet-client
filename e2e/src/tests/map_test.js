Feature('Map');

Scenario('test map component present logged-out', (I, mapPage) => {
  I.visit(mapPage.url);
  I.checkElementsPresent(mapPage.components);
  I.dontSeeElement(mapPage.addObjectButton);
});

Scenario('test map component present logged-in', (I, mapPage) => {
  I.login();
  I.visit(mapPage.url);
  I.checkElementsPresent(mapPage.components);
  I.seeElement(mapPage.addObjectButton);
});

Scenario('test initial filter', (I, mapPage) => {
  I.visit(mapPage.url);
  I.waitForText('Alle', mapPage.filter.source.dropdown);
  I.waitForText('Alle', mapPage.filter.species.dropdown);
  I.waitForText('2020', 2, mapPage.filter.phenoyear.dropdown);
});

Scenario('test add object navigation', async (I, mapPage, individualsEditPage) => {
  I.login();
  I.visit(mapPage.url);
  I.click(mapPage.addObjectButton);
  I.waitUrlEquals(individualsEditPage.newIndividualUrl);
});

Scenario('test regression on map markers for 2018', async (I, mapPage) => {
  I.visit(mapPage.url);
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 378); // 2018, all, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.meteoswiss);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 147); // 2018, meteoswiss, all
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.options.sycamore);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 122); // 2018, meteoswiss, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.all);
  I.wait(2);
  I.seeNumberOfElements(mapPage.mapMarker, 152); // 2018, all, sycamore
});

// missing tests
// - click pin and navigate to individual page
