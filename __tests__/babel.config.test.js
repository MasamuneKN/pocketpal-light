const babelConfig = require('../babel.config');

const ENV_KEYS = ['BABEL_ENV', 'NODE_ENV', 'E2E_BUILD', 'E2E_SKIP_ONBOARDING'];

let saved;

beforeEach(() => {
  saved = Object.fromEntries(ENV_KEYS.map(key => [key, process.env[key]]));
  ENV_KEYS.forEach(key => delete process.env[key]);
  process.env.BABEL_ENV = 'production';
});

afterEach(() => {
  ENV_KEYS.forEach(key => {
    if (saved[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = saved[key];
    }
  });
});

function evaluate(env) {
  Object.assign(process.env, env);
  let cacheKey;
  const config = babelConfig({
    cache: {
      using: fn => {
        cacheKey = fn();
        return cacheKey;
      },
    },
  });
  const define = config.plugins.find(
    plugin => Array.isArray(plugin) && plugin[0] === 'transform-define',
  );
  return {cacheKey, defines: define && define[1]};
}

describe('E2E build defines', () => {
  it.each([
    [{}, false, false],
    [{E2E_BUILD: 'true'}, true, true],
    [{E2E_BUILD: 'true', E2E_SKIP_ONBOARDING: 'false'}, true, false],
    [{E2E_BUILD: 'true', E2E_SKIP_ONBOARDING: 'true'}, true, true],
    [{E2E_BUILD: '1'}, false, false],
  ])(
    'bundling env %j defines E2E=%s and skip onboarding=%s',
    (env, isE2E, skipOnboarding) => {
      expect(evaluate(env).defines).toEqual({
        __E2E__: isE2E,
        __E2E_SKIP_ONBOARDING__: skipOnboarding,
      });
    },
  );

  it('includes E2E settings in the Babel cache key', () => {
    const standard = evaluate({}).cacheKey;
    const e2e = evaluate({E2E_BUILD: 'true'}).cacheKey;
    expect(e2e).not.toEqual(standard);
  });

  it('does not define build constants under Jest', () => {
    expect(evaluate({BABEL_ENV: 'test'}).defines).toBeUndefined();
  });
});
