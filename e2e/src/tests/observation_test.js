Feature('Observations');

Before(async ({ I, e2eRangerUser }) => {
  await I.clearTestData();
  I.mockGooglemaps();
  I.login(e2eRangerUser);
});

Scenario('add observation', async ({ I, individualsPage }) => {
  const individualId = await I.createDefaultIndividual('BL'); // use ranger species without limits
  I.visit(individualsPage, individualsPage.url(individualId));
  I.click(individualsPage.observation.addButton1);
  await I.checkVisual('observation_empty_dialog', 0, false, { retries: 5, wait: 0.5 });
  I.click(individualsPage.observation.addEdit.toggleCalendar);
  await I.checkVisual('observation_calendar_dialog', 0, false, { retries: 5, wait: 0.5 });
  I.click(individualsPage.observation.addEdit.calendar.day1);
  await I.checkVisual('observation_filled_dialog', 0, false, { retries: 5, wait: 0.5 });
}).tag('visual');

Scenario.todo('edit observation');

Scenario.todo('delete observation');
