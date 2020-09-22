/// <reference types='codeceptjs' />
type steps_file = typeof import('./steps_file.js');
type loginPage = typeof import('./pages/login.js');
type mapPage = typeof import('./pages/map.js');
type privateProfilePage = typeof import('./pages/private_profile.js');
type profileEditPage = typeof import('./pages/profile_edit.js');
type individualsPage = typeof import('./pages/individuals.js');
type individualsEditPage = typeof import('./pages/individuals_edit.js');
type statisticsPage = typeof import('./pages/statistics.js');
type navbarComponent = typeof import('./components/navbar.js');
type e2eTestUser = typeof import('./users/e2e_test.js');

declare namespace CodeceptJS {
  interface SupportObject {
    I: CodeceptJS.I;
    loginPage: loginPage;
    mapPage: mapPage;
    privateProfilePage: privateProfilePage;
    profileEditPage: profileEditPage;
    individualsPage: individualsPage;
    individualsEditPage: individualsEditPage;
    statisticsPage: statisticsPage;
    navbarComponent: navbarComponent;
    e2eTestUser: e2eTestUser;
  }
  interface CallbackOrder {
    [0]: CodeceptJS.I;
    [1]: loginPage;
    [2]: mapPage;
    [3]: privateProfilePage;
    [4]: profileEditPage;
    [5]: individualsPage;
    [6]: individualsEditPage;
    [7]: statisticsPage;
    [8]: navbarComponent;
    [9]: e2eTestUser;
  }
  interface Methods extends CodeceptJS.Playwright {}
  interface I extends ReturnType<steps_file> {}
  namespace Translation {
    interface Actions {}
  }
}
