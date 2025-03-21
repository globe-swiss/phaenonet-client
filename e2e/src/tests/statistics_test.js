Feature('Statistics');

Scenario('test yearly statistics regression on 2018', async ({ I, statisticsPage }) => {
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
  I.selectDropdownValue(
    statisticsPage.filter.analyticstype.dropdown,
    statisticsPage.filter.analyticstype.values.altitude
  );
  await I.checkVisual('statistics-2018_all_alt_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.meteoswiss);
  await I.checkVisual('statistics-2018_meteoswiss_alt_sycamore');
  I.selectDropdownValue(statisticsPage.filter.source.dropdown, statisticsPage.filter.source.values.phenonet);
  await I.checkVisual('statistics-2018_phaenonet_alt_sycamore');
}).tag('visual');

Scenario('test yearly statistics all year view', async ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 'all', true);
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.values.sycamore);
  await I.checkVisual('statistics-all_years_sycamore');
}).tag('visual');

Scenario('test weekly statistics regression on 2018', async ({ I, statisticsPage }) => {
  I.visit(statisticsPage);
  I.selectDropdownValue(statisticsPage.filter.graphtype.dropdown, statisticsPage.filter.graphtype.values.weekly);
  I.selectDropdownValue(statisticsPage.filter.phenoyear.dropdown, 2018, true);
  I.selectDropdownValue(statisticsPage.filter.species.dropdown, statisticsPage.filter.species.values.hazel);
  await I.checkVisual('statistics-weekly-2018_hs_all_all');
  I.selectDropdownValue(statisticsPage.filter.phenophase.dropdown, statisticsPage.filter.phenophase.values.BLA);
  await I.checkVisual('statistics-weekly-2018_hs_bla_all');
  I.selectDropdownValue(statisticsPage.filter.altgrp.dropdown, statisticsPage.filter.altgrp.values.alt3);
  await I.checkVisual('statistics-weekly-2018_hs_bla_alt3');
}).tag('visual');
