/* eslint-disable max-len */
Feature('Statistics');

const delay = 0;

Scenario('test quantil regression on 2018', ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.waitForDropdown(statisticsPage.filter.phenoyear.dropdown);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 2018, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 79); // 2018, all, species, all
  I.waitNumberOfVisibleElements(statisticsPage.label, 37);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 55); // 2018, phenonet, species, all
  I.waitNumberOfVisibleElements(statisticsPage.label, 29);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.meteoswiss, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 44); // 2018, meteoswiss, species, all
  I.waitNumberOfVisibleElements(statisticsPage.label, 30);
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.values.sycamore, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 2); // 2018, meteoswiss, species, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 5); // 2018, phenonet, species, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.all, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 5); // 2018, all, species, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.type.dropdown, statisticsPage.filter.type.values.altitude, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 16); // 2018, all, altitude, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 19);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.meteoswiss, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 10); // 2018, meteoswiss, altitude, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 19);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet, delay);
  I.waitNumberOfVisibleElements(statisticsPage.quantilbar, 10); // 2018, phaenonet, altitude, sycamore
  I.waitNumberOfVisibleElements(statisticsPage.label, 17);
});

Scenario('test all year view', ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.waitForDropdown(statisticsPage.filter.phenoyear.dropdown);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 'all');
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, 'BA', delay);
  I.waitNumberOfVisibleElements(statisticsPage.label, 28);
});
