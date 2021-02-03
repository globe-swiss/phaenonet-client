/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file.js');
type loginPage = typeof import('./pages/login.js');
type mapPage = typeof import('./pages/map.js');
type privateProfilePage = typeof import('./pages/private_profile.js');
type profileEditPage = typeof import('./pages/profile_edit.js');
type individualsPage = typeof import('./pages/individuals.js');
type individualsEditPage = typeof import('./pages/individuals_edit.js');
type statisticsPage = typeof import('./pages/statistics.js');
type stationsPage = typeof import('./pages/stations.js');
type navbarComponent = typeof import('./components/navbar.js');
type e2eTestUser = typeof import('./users/e2e_test.js');
type customHelper = import('./helpers/clickIfVisible.js');

declare namespace CodeceptJS {
  interface SupportObject {
    I: I;
    current: any;
    loginPage: loginPage;
    mapPage: mapPage;
    privateProfilePage: privateProfilePage;
    profileEditPage: profileEditPage;
    individualsPage: individualsPage;
    individualsEditPage: individualsEditPage;
    statisticsPage: statisticsPage;
    stationsPage: stationsPage;
    navbarComponent: navbarComponent;
    e2eTestUser: e2eTestUser;
  }
  interface Methods extends Playwright, Mochawesome, customHelper {}
  interface I extends ReturnType<steps_file>, WithTranslation<Mochawesome>, WithTranslation<customHelper> {}
  namespace Translation {
    interface Actions {}
  }
}
