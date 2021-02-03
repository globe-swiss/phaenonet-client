const { I, privateProfilePage } = inject();

module.exports = {
  url(individual_id) {
    return '/stations/' + individual_id;
  },
  components: {
    navigation: { css: 'app-nav' }
  }
};
