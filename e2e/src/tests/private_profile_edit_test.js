Feature('Private Profile Edit');

Scenario('test edit profile', async ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  // I.waitForElement(profileEditPage.saveButton);
  await I.checkVisual('private_profile_edit');
}).tag('@visual');

Scenario('test edit profile nick check', ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.seeElement(profileEditPage.saveButtonEnabled);
  I.clearField(profileEditPage.fields.nickname);
  I.type('xy');
  I.seeElement(profileEditPage.saveButtonDisabled);
  I.type('z'); // xyz must not exists
  I.seeElement(profileEditPage.saveButtonEnabled);
  I.clearField(profileEditPage.fields.nickname);
  I.type(e2eTestUser.nickname);
  I.seeElement(profileEditPage.saveButtonEnabled);
});

Scenario('test select languages', ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage, profileEditPage.url(e2eTestUser));
  I.see('Deutsch'); // de
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.options.fr);
  I.see('Français');
  I.see('Enregistrer');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.options.it);
  I.see('Italiano');
  I.see('Salva');
  I.click(profileEditPage.languageSelect.dropdown);
  I.click(profileEditPage.languageSelect.options.de);
  I.see('Deutsch');
  I.see('Speichern');
});
