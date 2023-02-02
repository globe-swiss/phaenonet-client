Feature('Public Profile');

Scenario('public profile page', async ({ I, publicProfilePage, e2eTestUser }) => {
  await I.clearTestData();
  I.visit(publicProfilePage, publicProfilePage.url(e2eTestUser.id));
  I.waitForText(e2eTestUser.nickname);

  await I.checkVisual('public_profile-profile_values');
}).tag('@visual');

Scenario.todo('test subscribe to profile', () => {
  // check image is displayed correctly
}).tag('@visual');
