import { sameTag, SheriffConfig } from '@softarc/sheriff-core';

export const sheriffConfig: SheriffConfig = {
  enableBarrelLess: true,
  showWarningOnBarrelCollision: false,
  modules: {
    'src/app': 'root',
    'src/app/domains/<domain>': 'domain:<domain>',
    src: {
      app: {
        core: 'root',
        shared: 'shared',
        'domains/<domain>': {
          'feature-<feature>': ['domain:<domain>', 'type:feature'],
          shared: ['domain:<domain>', 'type:shared']
        }
      },
      assert: 'root',
      environments: 'root'
    }
  },
  depRules: {
    root: ['*'],
    shared: 'root',
    'domain:*': ['root', 'shared', sameTag],
    'type:feature': ['root', 'shared', 'type:shared', 'type:models', 'type:util'],
    'type:shared': ['root', 'shared']
  }
};
