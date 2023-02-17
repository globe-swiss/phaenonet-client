Feature('Public Profile');

Before(async ({ I }) => {
  await I.clearTestData();
});

Scenario('public profile page loggedout', async ({ I, publicProfilePage, publicUser }) => {
  I.visit(publicProfilePage, publicProfilePage.url(publicUser.id));
  I.selectDropdownValue(publicProfilePage.yearDropdown, 2018);
  I.waitForText('Winterlinde');
  I.wait(1); // wait for images loading
  await I.checkVisual('public_profile-loggedout', 0, false, { retries: 3, wait: 1 });
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

Scenario('public profile species page', async ({ I, speciesPage, publicUser }) => {
  I.visit(speciesPage, speciesPage.url(publicUser.id, 'HS', 2018));
  I.wait(1); // wait for images loading
  await I.checkVisual('public_profile-species', 0, false, { retries: 3, wait: 1 });
}).tag('visual');
