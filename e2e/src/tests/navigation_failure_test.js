Feature('Navigation failures');

Scenario('test page not found', ({ I }) => {
  I.amOnPage('/not_existing');
  I.see('Hier ist etwas schiefgelaufen.');
});

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
  I.see('Hier ist etwas schiefgelaufen.');
});

Scenario('test station not found', ({ I, stationsPage }) => {
  I.amOnPage(stationsPage.url('not_existing'));
  I.see('Hier ist etwas schiefgelaufen.');
});

Scenario('test individual edit not found', ({ I, individualsEditPage }) => {
  I.login();
  I.amOnPage(individualsEditPage.url('not_existing'));
  I.see('Hier ist etwas schiefgelaufen.');
});
