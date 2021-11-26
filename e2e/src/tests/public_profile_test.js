Feature('Public Profile');

Scenario('test component present', ({ I, publicProfilePage, e2eTestUser }) => {
  I.visit(publicProfilePage.url(e2eTestUser.id));
  I.checkElementsPresent(publicProfilePage.components);
});

Scenario('public profile values', ({ I, publicProfilePage, e2eTestUser }) => {
  I.visit(publicProfilePage.url(e2eTestUser.id));
  I.see('PROFIL');
  I.see('BEOBACHTUNGEN');
  I.see('Öffentliches Profil von');
  I.see(e2eTestUser.nickname);
});
