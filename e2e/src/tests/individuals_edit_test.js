Feature('Edit Individual');

Scenario('test component present editing individuals', (I, individualsEditPage) => {
  I.login();
  I.visit(individualsEditPage.newIndividualUrl);
  I.checkElementsPresent(individualsEditPage.components);
});

Scenario('create individual', async (I, individualsEditPage, individualsPage) => {
  I.login();
  I.visit(individualsEditPage.newIndividualUrl);
  individualsEditPage.fillForm();
  I.click(individualsEditPage.saveButton);
  I.waitForElement(individualsPage.components.header, 5);
  I.deleteIndividual(await I.grabCurrentUrl());
});
