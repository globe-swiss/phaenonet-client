/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file.js');
type loginPage = typeof import('./pages/login.js');
type logoutPage = typeof import('./pages/logout.js');
type mapPage = typeof import('./pages/map.js');
type privateProfilePage = typeof import('./pages/private_profile.js');
type profileEditPage = typeof import('./pages/profile_edit.js');
type publicProfilePage = typeof import('./pages/public_profile.js');
type individualsPage = typeof import('./pages/individuals.js');
type individualsEditPage = typeof import('./pages/individuals_edit.js');
type invitesPage = typeof import('./pages/invites.js');
type statisticsPage = typeof import('./pages/statistics.js');
type stationsPage = typeof import('./pages/stations.js');
type navbarComponent = typeof import('./components/navbar.js');
type e2eTestUser = typeof import('./users/e2e_test.js');
type e2eRangerUser = typeof import('./users/e2e_ranger.js');
type publicUser = typeof import('./users/public_user.js');
type ResembleHelper = import('codeceptjs-resemblehelper');
type customHelper = import('./helpers/clickIfVisible.js');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    loginPage: loginPage;
    logoutPage: logoutPage;
    mapPage: mapPage;
    privateProfilePage: privateProfilePage;
    profileEditPage: profileEditPage;
    publicProfilePage: publicProfilePage;
    individualsPage: individualsPage;
    individualsEditPage: individualsEditPage;
    invitesPage: invitesPage;
    statisticsPage: statisticsPage;
    stationsPage: stationsPage;
    navbarComponent: navbarComponent;
    e2eTestUser: e2eTestUser;
    e2eRangerUser: e2eRangerUser;
    publicUser: publicUser;
  }
  interface Methods extends Playwright, ResembleHelper, Mochawesome, customHelper {}
  interface I
    extends ReturnType<steps_file>,
      WithTranslation<ResembleHelper>,
      WithTranslation<Mochawesome>,
      WithTranslation<customHelper> {}
  namespace Translation {
    interface Actions {}
  }
}
