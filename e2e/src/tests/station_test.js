Feature('Station View');

Before(({ I }) => {
  I.mockGooglemaps();
});

Scenario('test meteoswiss station', async ({ I, stationsPage }) => {
  I.visit(stationsPage, stationsPage.url('2018_ENB'));
  await I.checkVisual('stations_view-meteoswiss');
})
  .tag('@visual')
  .tag('@meteoswiss');

Scenario('test wld station', async ({ I, stationsPage }) => {
  I.visit(stationsPage, stationsPage.url('2018_wld_380222'));
  await I.checkVisual('stations_view-wld');
})
  .tag('@visual')
  .tag('@wld');
