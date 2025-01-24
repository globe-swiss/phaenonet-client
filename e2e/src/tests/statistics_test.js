Feature('Statistics');

Scenario('test quantil regression on 2018', async ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 2018, true);
  await I.checkVisual('statistics-2018_all_species_all');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet);
  await I.checkVisual('statistics-2018_phaenonet_species_all');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.meteoswiss);
  await I.checkVisual('statistics-2018_meteoswiss_species_all');
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.values.sycamore);
  await I.checkVisual('statistics-2018_meteoswiss_species_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet);
  await I.checkVisual('statistics-2018_phaenonet_species_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.all);
  await I.checkVisual('statistics-2018_all_species_sycamore');
  I.selectDropdownValue(statisticsPage.filter.type.dropdown, statisticsPage.filter.type.values.altitude);
  await I.checkVisual('statistics-2018_all_alt_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.meteoswiss);
  await I.checkVisual('statistics-2018_meteoswiss_alt_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet);
  await I.checkVisual('statistics-2018_phaenonet_alt_sycamore');
}).tag('visual');

Scenario('test all year view', async ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 'all', true);
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.values.sycamore);
  await I.checkVisual('statistics-all_years_sycamore');
}).tag('visual');
