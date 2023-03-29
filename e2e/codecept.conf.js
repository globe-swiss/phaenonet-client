// const { setHeadlessWhen } = require('@codeceptjs/configure');

// // turn on headless mode when running with HEADLESS=true environment variable
// // export HEADLESS=true && npx codeceptjs run
// setHeadlessWhen(process.env.HEADLESS);

// eslint-disable-next-line spaced-comment
/**@type {CodeceptJS.MainConfig}**/
exports.config = {
  tests: './src/tests/*_test.js',
  timeout: 60,
  output: './output/img',
  helpers: {
    Playwright: {
      url: 'http://localhost:4200',
      show: false,
      browser: 'chromium',
      windowSize: '1280x720',
      video: true,
      timeout: 30000,
      getPageTimeout: 30000,
      waitForTimeout: 30000
    },
    ResembleHelper: {
      require: 'codeceptjs-resemblehelper',
      screenshotFolder: './output/',
      baseFolder: './output/base/',
      diffFolder: './output/diff/'
    },
    Mochawesome: {
      uniqueScreenshotNames: true,
      fullPageScreenshots: true
    }
  },
  include: {
    I: './src/steps_file.js',
    loginPage: './src/pages/login.js',
    logoutPage: './src/pages/logout.js',
    registerPage: './src/pages/register.js',
    mapPage: './src/pages/map.js',
    privateProfilePage: './src/pages/private_profile.js',
    profileEditPage: './src/pages/profile_edit.js',
    publicProfilePage: './src/pages/public_profile.js',
    individualsPage: './src/pages/individuals.js',
    individualsEditPage: './src/pages/individuals_edit.js',
    speciesPage: './src/pages/species.js',
    invitesPage: './src/pages/invites.js',
    statisticsPage: './src/pages/statistics.js',
    stationsPage: './src/pages/stations.js',
    navbarComponent: './src/components/navbar.js',
    e2eTestUser: './src/users/e2e_test.js',
    e2eRangerUser: './src/users/e2e_ranger.js',
    publicUser: './src/users/public_user.js'
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output'
    }
  },
  name: 'phaenonet-client',
  plugins: {
    retryFailedStep: {
      enabled: false
    },
    retryTo: {
      enabled: true
    },
    screenshotOnFail: {
      enabled: true
    },
    subtitles: {
      enabled: true
    }
  }
};
