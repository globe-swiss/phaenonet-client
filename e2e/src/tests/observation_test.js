const assert = require('assert');

Feature('Observations');

Before(async ({ I, e2eRangerUser }) => {
  await I.clearTestData();
  I.mockGooglemaps();
  I.login(e2eRangerUser);
});

Scenario('add observation', async ({ I, individualsPage }) => {
  const individualId = await I.createDefaultIndividual('BL'); // use ranger species without limits
  I.visit(individualsPage, individualsPage.url(individualId));
  I.click(individualsPage.observation.obs1.add);
  await I.checkVisual('observation_empty_dialog', 0, false, { retries: 5, wait: 0.5 });
  I.click(individualsPage.observation.observationDialog.toggleCalendar);
  await I.checkVisual('observation_calendar_dialog', 0, false, { retries: 5, wait: 0.5 });
  I.click(individualsPage.observation.observationDialog.calendar.day1);
  await I.checkVisual('observation_filled_dialog', 0, false, { retries: 5, wait: 0.5 });
}).tag('visual');

Scenario('add/edit/delete observation', async ({ I, individualsPage }) => {
  let value;
  const individualId = await I.createDefaultIndividual('BL'); // use ranger species without limits
  I.visit(individualsPage, individualsPage.url(individualId));
  I.say('Add Observation');
  I.click(individualsPage.observation.obs1.add);
  I.click(individualsPage.observation.observationDialog.toggleCalendar);
  I.click(individualsPage.observation.observationDialog.calendar.day1);
  I.click(individualsPage.observation.observationDialog.saveButton);
  I.waitForVisible(individualsPage.observation.obs1.date);
  value = await I.grabValueFrom(individualsPage.observation.obs1.date);
  assert(value.startsWith('01.'), value);
  I.say('Edit Observation');
  I.click(individualsPage.observation.obs1.edit);
  I.click(individualsPage.observation.observationDialog.toggleCalendar);
  I.click(individualsPage.observation.observationDialog.calendar.day2);
  I.click(individualsPage.observation.observationDialog.saveButton);
  I.waitForVisible(individualsPage.observation.obs1.date);
  value = await I.grabValueFrom(individualsPage.observation.obs1.date);
  assert(value.startsWith('02.'), value);
  I.say('Delete Observation');
  I.click(individualsPage.observation.obs1.edit);
  I.click(individualsPage.observation.observationDialog.deleteButton);
  I.waitForValue(individualsPage.observation.obs1.date, '', 1);
});
