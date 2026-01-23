Feature('Private Profile Edit');

Scenario('test edit profile', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  await I.checkVisual('private_profile_edit');
}).tag('visual');

Scenario('test edit profile nick check', ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.waitForElement(profileEditPage.saveButtonEnabled);
  I.clearField(profileEditPage.fields.nickname);
  I.type('xy');
  I.waitForElement(profileEditPage.saveButtonDisabled);
  I.type('z'); // xyz must not exists
  I.waitForElement(profileEditPage.saveButtonEnabled);
  I.clearField(profileEditPage.fields.nickname);
  I.type(e2eTestUser.nickname);
  I.waitForElement(profileEditPage.saveButtonEnabled);
});

Scenario('test select languages', ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.waitForText('Deutsch'); // de
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.fr);
  I.waitForText('Français');
  I.waitForText('Enregistrer');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.it);
  I.waitForText('Italiano');
  I.waitForText('Salva');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.de);
  I.waitForText('Deutsch');
  I.waitForText('Speichern');
});

Scenario('test edit profile email', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.click(profileEditPage.editEmailIcon);
  await I.checkVisual('private_profile_edit-edit_email', 0.02); // ng20 minor diff
}).tag('visual');

Scenario('test edit profile password', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.click(profileEditPage.editPasswordIcon);
  await I.checkVisual('private_profile_edit-edit_password', 0.02); // ng20 minor diff
}).tag('visual');
