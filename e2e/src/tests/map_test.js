Feature('Map');

Before(({ I }) => {
  I.mockGooglemaps();
});

Scenario('test map add object present logged-out', ({ I, mapPage, loginPage }) => {
  I.visit(mapPage);
  I.amLoggedOut();
  I.seeElement(mapPage.addObjectButton);
  I.click(mapPage.addObjectButton);
  I.waitUrlEquals(loginPage.url);
});

Scenario('test map add object present logged-in', ({ I, mapPage, individualsEditPage }) => {
  I.login();
  I.visit(mapPage);
  I.seeElement(mapPage.addObjectButton);
  I.click(mapPage.addObjectButton);
  I.waitUrlEquals(individualsEditPage.newIndividualUrl);
});

Scenario('test initial filter', ({ I, mapPage }) => {
  I.visit(mapPage);
  I.waitForText('Alle', 1, mapPage.filter.source.dropdown);
  I.waitForText('Alle', 1, mapPage.filter.species.dropdown);
  I.waitForDropdown(mapPage.filter.phenoyear.dropdown);
});

Scenario('test regression on map markers for 2018', ({ I, mapPage }) => {
  I.visit(mapPage);
  I.waitForDropdown(mapPage.filter.phenoyear.dropdown);
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 387); // 2018, all, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.meteoswiss);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 147); // 2018, meteoswiss, all
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.options.sycamore);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 122); // 2018, meteoswiss, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.options.all);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 154); // 2018, all, sycamore
});

Scenario.todo('test marker no img', () => {
  // click marker without image
  // test visual element
}).tag('visual');

Scenario.todo('test marker img', () => {
  // click marker with image
  // test visual element
}).tag('visual');

Scenario.todo('test marker with sensor', () => {
  // click marker with image
  // test visual element
}).tag('visual');
