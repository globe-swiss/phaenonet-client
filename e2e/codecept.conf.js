// const { setHeadlessWhen } = require('@codeceptjs/configure');
const fetch = require('node-fetch');

// // turn on headless mode when running with HEADLESS=true environment variable
// // export HEADLESS=true && npx codeceptjs run
// setHeadlessWhen(process.env.HEADLESS);

exports.config = {
  tests: './src/tests/*_test.js',
  output: './output',
  helpers: {
    Playwright: {
      url: 'http://localhost:4200',
      show: false,
      browser: 'chromium',
      waitForTimeout: 5000
    },
    Mochawesome: {
      uniqueScreenshotNames: false,
      fullPageScreenshots: true
    },
    customHelper: {
      require: './src/helpers/clickIfVisible.js'
    }
  },
  include: {
    I: './src/steps_file.js',
    loginPage: './src/pages/login.js',
    mapPage: './src/pages/map.js',
    privateProfilePage: './src/pages/private_profile.js',
    profileEditPage: './src/pages/profile_edit.js',
    individualsPage: './src/pages/individuals.js',
    individualsEditPage: './src/pages/individuals_edit.js',
    statisticsPage: './src/pages/statistics.js',
    navbarComponent: './src/components/navbar.js',
    e2eTestUser: './src/users/e2e_test.js'
  },
  bootstrap: async () => {
    console.log('clear individuals for e2e user');
    await fetch('https://europe-west1-phaenonet-test.cloudfunctions.net/e2e_clear_individuals');
  },
  mocha: {
    reporterOptions: {
      reportDir: 'output'
    }
  },
  name: 'phaenonet-client',
  plugins: {
    retryFailedStep: {
      enabled: true,
      retries: 10
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true
    },
    pauseOnFail: {}
  },
  multiple: {
    basic: {
      browsers: ['chromium', 'firefox', 'webkit']
    }
  }
};
