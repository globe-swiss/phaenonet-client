const { I } = inject();

module.exports = {
  url: '/auth/login',
  components: {
    navigation: { css: 'app-nav' },
    form: { css: 'app-login-form' }
  },
  fields: {
    email: { css: 'app-login-form #email' },
    password: { css: 'app-login-form #password' }
  },
  loginButton: { css: 'app-login-form #login-button' },

  login(email, password) {
    I.fillField(this.fields.email, email);
    I.fillField(this.fields.password, password);
    I.click(this.loginButton);
  }
};
