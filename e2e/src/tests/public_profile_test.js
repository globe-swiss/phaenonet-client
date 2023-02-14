Feature('Public Profile');

Before(async ({ I }) => {
  await I.clearTestData();
});

Scenario('public profile page loggedout', async ({ I, publicProfilePage, e2eTestUser }) => {
  I.visit(publicProfilePage, publicProfilePage.url(e2eTestUser.id));
  I.waitForText(e2eTestUser.nickname);

  await I.checkVisual('public_profile-loggedout');
}).tag('visual');

Scenario('public profile page loggedin', async ({ I, publicProfilePage, e2eTestUser, e2eRangerUser }) => {
  I.login(e2eRangerUser);
  I.visit(publicProfilePage, publicProfilePage.url(e2eTestUser.id));
  I.waitForText(e2eTestUser.nickname);

  await I.checkVisual('public_profile-loggedin');
}).tag('visual');

Scenario('public profile page loggedout', async ({ I, publicProfilePage, e2eRangerUser }) => {
  I.visit(publicProfilePage, publicProfilePage.url(e2eRangerUser.id));
  I.waitForText(e2eRangerUser.nickname);

  await I.checkVisual('public_profile-loggedout_ranger');
})
  .tag('visual')
  .tag('ranger');

Scenario('test subscribe to profile', ({ I, publicProfilePage, publicUser, e2eTestUser }) => {
  I.login(e2eTestUser);
  I.visit(publicProfilePage, publicProfilePage.url(publicUser.id));
  I.waitForElement(publicProfilePage.followButton);
  I.click(publicProfilePage.followButton);
  I.waitForElement(publicProfilePage.unfollowButton);
  I.click(publicProfilePage.unfollowButton);
  I.waitForElement(publicProfilePage.followButton);
});
