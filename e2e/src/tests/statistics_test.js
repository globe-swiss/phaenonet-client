/* eslint-disable max-len */
Feature('Statistics');

Scenario('test quantil regression on 2018', ({ I, statisticsPage }) => {
  // fixme: test will fail after phenoyear rollover -> based on 2023
  I.visit(statisticsPage.url);
  I.waitForText('2023', 5, statisticsPage.filter.phenoyear.dropdown);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 2018);
  I.seeNumberOfElements(statisticsPage.quantilbar, 79); // 2018, all, species, all
  I.seeNumberOfElements(statisticsPage.label, 37);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.phenonet);
  I.seeNumberOfElements(statisticsPage.quantilbar, 55); // 2018, phenonet, species, all
  I.seeNumberOfElements(statisticsPage.label, 29);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.meteoswiss);
  I.seeNumberOfElements(statisticsPage.quantilbar, 44); // 2018, meteoswiss, species, all
  I.seeNumberOfElements(statisticsPage.label, 30);
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.options.sycamore);
  I.seeNumberOfElements(statisticsPage.quantilbar, 2); // 2018, meteoswiss, species, sycamore
  I.seeNumberOfElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.phenonet);
  I.seeNumberOfElements(statisticsPage.quantilbar, 5); // 2018, phenonet, species, sycamore
  I.seeNumberOfElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.all);
  I.seeNumberOfElements(statisticsPage.quantilbar, 5); // 2018, all, species, sycamore
  I.seeNumberOfElements(statisticsPage.label, 15);
  I.selectDropdownValue(statisticsPage.filter.type.dropdown, statisticsPage.filter.type.options.altitude);
  I.seeNumberOfElements(statisticsPage.quantilbar, 16); // 2018, all, altitude, sycamore
  I.seeNumberOfElements(statisticsPage.label, 19);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.meteoswiss);
  I.seeNumberOfElements(statisticsPage.quantilbar, 10); // 2018, meteoswiss, altitude, sycamore
  I.seeNumberOfElements(statisticsPage.label, 19);
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.options.phenonet);
  I.seeNumberOfElements(statisticsPage.quantilbar, 10); // 2018, phaenonet, altitude, sycamore
  I.seeNumberOfElements(statisticsPage.label, 17);
});

Scenario('test all year view', ({ I, statisticsPage }) => {
  // fixme: test will fail after phenoyear rollover -> based on 2023
  I.visit(statisticsPage.url);
  I.waitForText('2023', 5, statisticsPage.filter.phenoyear.dropdown);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 'all');
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, 'BA');
  I.seeNumberOfElements(statisticsPage.label, 27);
});
