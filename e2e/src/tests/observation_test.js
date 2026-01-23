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
  I.click(individualsPage.observations.addButtons.at(1));
  await I.checkVisual('observation_empty_dialog', 0.01, { retries: 5, wait: 0.5 }); // ng20 minor diff
  I.click(individualsPage.observations.observationDialog.toggleCalendar);
  await I.checkVisual('observation_calendar_dialog', 0.01, { retries: 5, wait: 0.5 }); // ng20 minor diff
  I.click(individualsPage.observations.observationDialog.calendar.day1);
  await I.checkVisual('observation_filled_dialog', 0.01, { retries: 5, wait: 0.5 }); // ng20 minor diff
}).tag('visual');

Scenario('add/edit/delete observation', async ({ I, individualsPage }) => {
  let value;
  const individualId = await I.createDefaultIndividual('BL'); // use ranger species without limits
  I.visit(individualsPage, individualsPage.url(individualId));
  I.say('Add Observation');
  // retry to mitigate 'Element not attached to DOM' error on dynamic content
  I.retry().click(individualsPage.observations.addButtons.at(1));
  I.click(individualsPage.observations.observationDialog.toggleCalendar);
  I.click(individualsPage.observations.observationDialog.calendar.day1);
  I.click(individualsPage.observations.observationDialog.saveButton);
  I.waitForVisible(individualsPage.observations.dateFields.at(1));
  I.wait(0.2);
  value = await I.grabValueFrom(individualsPage.observations.dateFields.at(1));
  assert(value.startsWith('01.'), value);
  // cannot select days in the future
  if (new Date().getDate() > 1) {
    I.say('Edit Observation');
    I.retry().click(individualsPage.observations.editButtons.at(1));
    I.click(individualsPage.observations.observationDialog.toggleCalendar);
    I.click(individualsPage.observations.observationDialog.calendar.day2);
    I.click(individualsPage.observations.observationDialog.saveButton);
    I.waitForVisible(individualsPage.observations.dateFields.at(1));
    I.wait(0.2);
    value = await I.grabValueFrom(individualsPage.observations.dateFields.at(1));
    assert(value.startsWith('02.'), value);
  } else {
    I.say('skip edit test on 1st of the month');
  }
  I.say('Delete Observation');
  I.retry().click(individualsPage.observations.editButtons.at(1));
  I.click(individualsPage.observations.observationDialog.deleteButton);
  I.waitForValue(individualsPage.observations.dateFields.at(1), '', 1);
});
