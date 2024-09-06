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
  I.see('Deutsch'); // de
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.fr);
  I.see('Français');
  I.see('Enregistrer');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.it);
  I.see('Italiano');
  I.see('Salva');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.values.de);
  I.see('Deutsch');
  I.see('Speichern');
});

Scenario('test edit profile email', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.click(profileEditPage.editEmailIcon);
  await I.checkVisual('private_profile_edit-edit_email'); // add retry delay if flaky
}).tag('visual');

Scenario('test edit profile password', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.click(profileEditPage.editPasswordIcon);
  await I.checkVisual('private_profile_edit-edit_password');
}).tag('visual');
