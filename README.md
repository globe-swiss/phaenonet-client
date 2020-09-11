# Phaenonet Client

This project is the web-client application for the phenology oberservation offer [PhaenoNet](https://www.phaenonet.ch) by [GLOBE Switzerland](https://www.globe-swiss.ch).

## Environment

Phaenonet is set up with two Firebase projects instances. These projects have a separate Firestore and storage instance as well as access rules.

- [phaenonet](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the production instance
- [phaenonet-test](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the test instance

On `phaenonet-test` project two web application are hostet:

- The `dev` application <https://phaenonet-dev.web.app/> which is deployed manually
- The `test` application <https://phaenonet-test.web.app/> which is deployed automatically on code merge to master

The `phenonet` project only hosts the productive web application <https://app.phaenonet.ch/>.

### Server side setup

#### Creating a project from scratch

1. Create the project in GCP or Firebase
   - <https://console.firebase.google.com/u/0/>
1. Enable Maps and Elevation API
   - <https://console.cloud.google.com/marketplace/details/google/maps-backend.googleapis.com>
   - <https://console.cloud.google.com/marketplace/details/google/elevation-backend.googleapis.com>
1. Enable username/password authentication in Firebase
   - <https://console.firebase.google.com/u/0/project/[project_name]/authentication/providers>
1. (optional) set outgoing email address
   - <https://console.firebase.google.com/u/0/project/[project_name]/authentication/emails>
1. Install cloud functions and setup configuration data
   - <https://github.com/globe-swiss/phaenonet-functions>

### Local setup

#### Configure Firebase

Install Node.js and npm see: <https://www.npmjs.com/get-npm>

Install the firebase console and login:

```commandline
npm install
npx firebase login
```

Consult the official documentation for the [Firebase CLI](https://firebase.google.com/docs/cli) for further information.

#### Configure deployment targets

Deployment targets only need to be confiugured once as they are saved server side.
To check if the targets are configured use `npx firebase target --project [phaenonet|phaenonet-test]`.

Configure targets using firebase CLI:

```commandline
npx firebase target:apply hosting dev phaenonet-dev --project phaenonet-test
npx firebase target:apply hosting test phaenonet-test --project phaenonet-test
npx firebase target:apply hosting prod phaenonet --project phaenonet
```

#### Configure local credentials

Copy [init.json](https://phaenonet-test.web.app/__/firebase/init.json) credential file for local development in the `src/local/` folder.

## Development Deployment

The application will be using the database and rules of the `phaenonet-test` project for all use-cases described in this section.

### Serve locally

Make sure `init.json` credential file for local development is placed in the `src/local/` folder.

Run a dev server.

```commandline
npx ng serve --c=local --aot
```

Navigate to <http://localhost:4200/>. The app will automatically reload if you change any of the source files.

### Run end-to-end tests

To run e2e-test first run a local server as described in the previous chapter.

Install the required dependencies

```commandline
cd e2e
npm install
```

and run the tests with `codeceptjs`

```commandline
codeceptjs run --reporter mochawesome
```

Test output will be located in `/e2e/output`.

### Deploy development applications

Deploy the development application to <https://phaenonet-dev.web.app/> by building and deploying the current workspace:

```commandline
npx ng build --aot && npx firebase deploy --only hosting:dev --project phaenonet-test --config=firebase-dev.json
```

Rules and indexes for Firestore and Storage will need to be deployed manually if needed.
Be aware that the rules are shared between the `dev` and `test` applicaton.

```commandline
npx firebase deploy --only storage,firestore --project phaenonet-test --config=firebase-dev.json
```

### Deploy application for acceptance test

Code merged to the `master` branch will be deployed to <https://phaenonet-test.web.app/> for final acceptance. This deployment will also include all rules and indexes.

To manually deploy a test version:

```commandline
npx ng build --aot && npx firebase deploy --project phaenonet-test --config=firebase-test.json
```

## Production Deployment

```commandline
npx ng build --prod && npx firebase deploy --project phaenonet --config=firebase-prod.json
```
