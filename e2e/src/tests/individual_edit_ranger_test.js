Feature('Edit Ranger Individual');

Before(async ({ I, e2eRangerUser }) => {
  I.mockGooglemaps();
  I.login(e2eRangerUser);
});

Scenario('create individual', async ({ I, individualsEditPage, individualsPage }) => {
  I.visit(individualsEditPage, individualsEditPage.newIndividualUrl);
  await I.checkVisual('edit_individual-create-empty_form', 0, false, { retries: 5, wait: 0.5 });
  individualsEditPage.fillForm();
  I.click(individualsEditPage.saveButton);
  I.waitForComponents(individualsPage.components);
})
  .tag('@visual')
  .tag('@ranger');

Scenario('edit individual', async ({ I, individualsEditPage, individualsPage }) => {
  const individualId = await I.createDefaultIndividual();
  I.visit(individualsEditPage, individualsEditPage.url(individualId));
  await I.checkVisual('edit_individual-edit-filled_form', 0, false, { retries: 5, wait: 0.5 });
  I.fillField(individualsEditPage.gradient.field, '33');
  I.click(individualsEditPage.saveButton);
  I.waitForComponents(individualsPage.components);
  I.waitForText('33%', 5, individualsPage.components.descriptionInfo);
})
  .tag('@visual')
  .tag('@ranger');
