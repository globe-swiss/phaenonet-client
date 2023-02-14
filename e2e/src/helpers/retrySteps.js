const { v1 } = require('uuid');
const { recorder, output } = require('codeceptjs');

// author: https://github.com/codeceptjs/CodeceptJS/issues/3267#issuecomment-1152363535

// Code in this file is base on:
// https://github.com/codeceptjs/CodeceptJS/blob/3.x/lib/plugin/retryTo.js

/**
 * Function to retry a sequence of steps if one fails
 * @param {*} I : self explanatory
 * @param {*} callback : function that excepts I and contains sequence of steps
 * @param {*} maxTries : number of retries. Defaults to 1
 * @param {*} retryOffset : time in ms to wait between retries
 *
 * Example call:
 * await retrySteps(I, (I) => {
 *     I.click('#some-id');
 *     I.click('Some title');
 * }, 2, 1000);
 */
async function retrySteps(I, callback, maxTries, retryOffset) {
  let tries = 1;

  const retryBlockId = v1().substring(0, 4);

  return new Promise(finish => {
    const tryBlock = () => {
      recorder.session.start(`retrySteps ${retryBlockId} ${tries}`);
      callback(I, tries);

      recorder.add(() => {
        recorder.session.restore(`retrySteps ${retryBlockId} ${tries}`);
        finish(null);
      });

      recorder.session.catch(e => {
        recorder.session.restore(`retrySteps ${retryBlockId} ${tries}`);
        tries += 1;
        if (tries <= maxTries) {
          output.debug(`Error ${e}... Retrying #${tries}`);

          recorder.add(`retrySteps ${retryBlockId}`, () => {
            I.wait((retryOffset || 0) / 1000);
            tryBlock();
          });
        } else {
          finish(e);
        }
      });
    };

    recorder.add(`retrySteps ${retryBlockId}`, tryBlock).catch(e => finish(e));
  }).then(err => {
    if (err) recorder.throw(err);
  });
}

module.exports = {
  retrySteps
};
