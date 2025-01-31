module.exports = {
  component: { css: 'app-observation-list' },
  listItems: { css: '[data-test-id=observation-item]' },
  /**
   * @param {number} num
   */
  getItem(num) {
    return locate(this.listItems).at(num);
  },
  withinItem: {
    image: { css: '[data-test-id=observation-item__image]' },
    species: { css: '[data-test-id=observation-item__species]' },
    name: { css: '[data-test-id=observation-item_name]' }
  }
};
