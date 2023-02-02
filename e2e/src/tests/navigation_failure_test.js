Feature('Navigation failures');

Scenario('test page not found', async ({ I }) => {
  I.amOnPage('/not_existing');
  I.see('Hier ist etwas schiefgelaufen.');
  await I.checkVisual('navigation_failures-page_not_found');
}).tag('@visual');

Scenario('test individuals redirects', ({ I, mapPage, individualsPage }) => {
  I.amOnPage(individualsPage.url(''));
  I.waitUrlEquals(mapPage.url);
});

Scenario('test stations redirects', ({ I, mapPage, stationsPage }) => {
  I.amOnPage(stationsPage.url(''));
  I.waitUrlEquals(mapPage.url);
});

Scenario('test individual not found', ({ I, individualsPage }) => {
  I.amOnPage(individualsPage.url('not_existing'));
  I.waitForText('Hier ist etwas schiefgelaufen.');
});

Scenario('test station not found', ({ I, stationsPage }) => {
  I.amOnPage(stationsPage.url('not_existing'));
  I.waitForText('Hier ist etwas schiefgelaufen.');
});

Scenario('test individual edit not found', ({ I, individualsEditPage }) => {
  I.login();
  I.amOnPage(individualsEditPage.url('not_existing'));
  I.waitForText('Hier ist etwas schiefgelaufen.');
});

Scenario('test public profile not found', ({ I, publicProfilePage }) => {
  I.amOnPage(publicProfilePage.url('not_existing'));
  I.waitForText('Hier ist etwas schiefgelaufen.');
});
