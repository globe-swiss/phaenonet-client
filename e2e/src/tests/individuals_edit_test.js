Feature('Edit Individual');

Scenario('test component present editing individuals', (I, individualsEditPage) => {
  I.login();
  individualsEditPage.visit('new');
  for (let component of Object.values(individualsEditPage.components)) {
    I.seeElement(component);
  }
});

Scenario('create individual', (I, individualsEditPage) => {
  I.login();
  individualsEditPage.visit('new');
  individualsEditPage.fillForm();
  I.click(individualsEditPage.saveButton);
});
