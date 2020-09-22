const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './e2e/src/tests/*_test.js',
  output: './e2e/output',
  helpers: {
    Playwright: {
      url: 'http://localhost:4200',
      show: false,
      browser: 'chromium',
      waitForTimeout: 5000
    }
  },
  include: {
    I: './e2e/src/steps_file.js',
    loginPage: './e2e/src/pages/login.js',
    mapPage: './e2e/src/pages/map.js',
    privateProfilePage: './e2e/src/pages/private_profile.js',
    profileEditPage: './e2e/src/pages/profile_edit.js',
    individualsPage: './e2e/src/pages/individuals.js',
    individualsEditPage: './e2e/src/pages/individuals_edit.js',
    statisticsPage: './e2e/src/pages/statistics.js',
    navbarComponent: './e2e/src/components/navbar.js',
    e2eTestUser: './e2e/src/users/e2e_test.js'
  },
  bootstrap: null,
  mocha: {},
  name: 'phaenonet-client',
  plugins: {
    retryFailedStep: {
      enabled: true
    },
    screenshotOnFail: {
      enabled: true
    }
  },
  multiple: {
    basic: {
      browsers: ['chromium', 'firefox', 'webkit']
    }
  }
};
