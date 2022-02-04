Feature('Invites');

Before(async ({ I, invitesPage }) => {
  await I.clearTestData();
  I.login();
  I.visit(invitesPage.url);
});

Scenario('test component present invites', ({ I, invitesPage }) => {
  I.checkElementsPresent(invitesPage.components);
});

Scenario('test component send invite', ({ I, invitesPage }) => {
  I.see('keine Einladungen vorhanden');
  I.click(invitesPage.invitesList.inviteButton);
  I.fillField(invitesPage.invitesDialog.textfield, 'verylongunusedemailadress@example.com');
  I.click(invitesPage.invitesDialog.sendButton);
  I.see('verylongunusedemailadress@example.com', invitesPage.invitesList.openInviteList);
  I.seeElement(invitesPage.invitesList.inviteButton);
});
