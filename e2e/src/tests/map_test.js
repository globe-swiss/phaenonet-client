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
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018, true);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 388); // 2018, all, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.meteoswiss);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 148); // 2018, meteoswiss, all
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.values.sycamore);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 122); // 2018, meteoswiss, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.all);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 154); // 2018, all, sycamore
});

Scenario('test marker with img', async ({ I, mapPage }) => {
  I.visit(mapPage);
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet, true);
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018, true);
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.values.hazel, true);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 54);
  await mapPage.waitForMarkers();

  await I.clickXY(930, 690, 'individuals/2018_1531');
  await I.waitForImage(mapPage.infoWindow.individualImage);
  await I.checkVisual('map-test_marker_img', 0.3);
}).tag('visual');

Scenario('test marker no img', async ({ I, mapPage }) => {
  I.visit(mapPage);
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet, true);
  I.selectDropdownValue(mapPage.filter.phenoyear.dropdown, 2018, true);
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.values.hazel, true);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 54);
  await mapPage.waitForMarkers();

  await I.clickXY(250, 400, 'individuals/2018_864');
  await I.checkVisual('map-test_marker_no_img', 0.3);
}).tag('visual');

Scenario.todo('test marker with sensor no img', () => {
  // click marker with no image
  // test visual element
}).tag('visual');

Scenario.todo('test marker with sensor img', () => {
  // click marker with image
  // test visual element
}).tag('visual');
