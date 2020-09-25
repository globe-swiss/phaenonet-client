'use strict';

let Helper = codecept_helper;

class MyHelper extends Helper {
  async clickIfVisible(selector, ...options) {
    const helper = this.helpers['Playwright'];
    try {
      const numVisible = await helper.grabNumberOfVisibleElements(selector);

      if (numVisible) {
        return helper.click(selector, ...options);
      }
    } catch (err) {
      // console.log('Skipping operation as element is not visible -> ' + selector);
    }
  }
}

module.exports = MyHelper;