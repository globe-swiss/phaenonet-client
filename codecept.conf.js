const { setHeadlessWhen } = require('@codeceptjs/configure');

// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: 'e2e-tests/*_test.js',
  output: './e2e-tests/output',
  helpers: {
    Playwright: {
      url: 'http://localhost:4200',
      show: false,
      browser: 'chromium'
    },
    ChaiWrapper: {
      require: 'codeceptjs-chai'
    }
  },
  include: {
    I: './steps_file.js',
    loginPage: './e2e-tests/pages/login.js',
    mapPage: './e2e-tests/pages/map.js',
    privateProfilePage: './e2e-tests/pages/private_profile.js',
    profileEditPage: './e2e-tests/pages/profile_edit.js',
    individualsEditPage: './e2e-tests/pages/individuals_edit.js',
    navbarComponent: './e2e-tests/components/navbar.js',
    e2eTestUser: './e2e-tests/users/e2e_test.js'
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
  }
};
