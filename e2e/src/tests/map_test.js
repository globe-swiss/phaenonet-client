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
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 387); // 2018, all, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 231); // 2018, phenonet, all
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.meteoswiss);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 147); // 2018, meteoswiss, all
  I.selectDropdownValue(mapPage.filter.species.dropdown, mapPage.filter.species.values.sycamore);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 122); // 2018, meteoswiss, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.phenonet);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 30); // 2018, phenonet, sycamore
  I.selectDropdownValue(mapPage.filter.source.dropdown, mapPage.filter.source.values.all);
  I.waitNumberOfVisibleElements(mapPage.mapMarker, 154); // 2018, all, sycamore
});

Scenario.todo('test marker no img', () => {
  /** v3.5.10
  Now we expose the WebElements that are returned by the WebHelper and you could make the subsequence actions on them.

  // Playwright helper would return the Locator

  I.amOnPage('/form/focus_blur_elements');
  const webElements = await I.grabWebElements('#button');
  webElements[0].click();
  */
  // click marker without image
  // test visual element
}).tag('visual');

Scenario.todo('test marker img', () => {
  // click marker with image
  // test visual element
}).tag('visual');

Scenario.todo('test marker with sensor no img', () => {
  // click marker with no image
  // test visual element
}).tag('visual');

Scenario.todo('test marker with sensor img', () => {
  // click marker with image
  // test visual element
}).tag('visual');
