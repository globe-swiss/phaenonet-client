Feature('Edit Individual');

Scenario('test component present editing individuals', (I, individualsEditPage) => {
  I.login();
  I.amOnPage(individualsEditPage.newIndividualUrl);
  for (component of Object.values(individualsEditPage.components)) {
    I.seeElement(component);
  }
});

Scenario('create individual', (I, individualsEditPage) => {
  I.login();
  I.amOnPage(individualsEditPage.newIndividualUrl);
  I.wait(5);
  individualsEditPage.fillForm();
  I.click(individualsEditPage.saveButton);
  fail(); // map height was not processed
});
