Feature('Invites');

Before(async ({ I, invitesPage }) => {
  await I.clearTestData();
  I.login();
  I.visit(invitesPage);
});

Scenario('test no invites', async ({ I }) => {
  await I.checkVisual('invites-no_invites');
}).tag('visual');

Scenario('test component send invite', async ({ I, invitesPage }) => {
  I.see('keine Einladungen vorhanden');
  I.click(invitesPage.invitesList.inviteButton);
  await I.checkVisual('invites-dialog', 0, { retries: 5, wait: 0.5 });
  I.wait(0.2); // why-so-ever without waiting fillField fails
  I.fillField(invitesPage.invitesDialog.textfield, 'verylongunusedemailadress@example.com');
  I.click(invitesPage.invitesDialog.sendButton);
  I.waitForText('verylongunusedemailadress@example.com', 10, invitesPage.invitesList.openInviteList);
  await I.checkVisual('invites-has_invite');
}).tag('visual');
