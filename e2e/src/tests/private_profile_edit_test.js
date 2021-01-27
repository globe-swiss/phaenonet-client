Feature('Private Profile Edit');

Scenario('test edit profile nick check', ({ I, profileEditPage, e2eTestUser }) => {
  I.login();
  I.visit(profileEditPage.url(e2eTestUser));
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
