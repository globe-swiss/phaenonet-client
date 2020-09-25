# Playwright image with CodeceptJS installed

## Usage

Exeute CodeceptJS with Playwright locally:

```bash
docker run --net=host -v $PWD:/tests globeswiss/codeceptjs-playwright
```

Customize execution to run tests with steps:

```bash
docker run --net=host -v $PWD:/tests globeswiss/codeceptjs-playwright run --steps
```

To wait for a development server to be ready to, override the entrypoint:

```bash
docker run --net=host -v $PWD:/tests --entrypoint 'wait-for-it' globeswiss/codeceptjs-playwright '<host>:<port> -- npx codeceptjs run'
```