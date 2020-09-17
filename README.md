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

#### Configure deployment targets

Deployment targets only need to be confiugured once as they are saved server side.
To check if the targets are configured use `firebase target --project [phaenonet|phaenonet-test]`.

Configure targets using firebase CLI:

```commandline
firebase target:apply hosting dev phaenonet-dev --project phaenonet-test
firebase target:apply hosting test phaenonet-test --project phaenonet-test
firebase target:apply hosting prod phaenonet --project phaenonet
```

### Local setup

#### Configure Firebase

Install Node.js and npm see: <https://www.npmjs.com/get-npm>

Install the firebase console and login:

```commandline
npm install -g firebase-tools
firebase login
```

Consult the official documentation for the [Firebase CLI](https://firebase.google.com/docs/cli) for further information.

#### Configure local credentials

Copy [init.json](https://phaenonet-test.web.app/__/firebase/init.json) credential file for local development in the `src/local/` folder.

## Development Deployment

The application will be using the database and rules of the `phaenonet-test` project for all use-cases described in this section.

### Serve locally

Make sure `init.json` credential file for local development is placed in the `src/local/` folder.

Run `ng serve --c=local --aot` for a dev server. Navigate to <http://localhost:4200/>. The app will automatically reload if you change any of the source files.

### Deploy development applications

Deploy the development application to <https://phaenonet-dev.web.app/> by building and deploying the current workspace:

```commandline
ng build --aot && firebase deploy --only hosting:dev --project phaenonet-test --config=firebase-dev.json
```

Rules and indexes for Firestore and Storage will need to be deployed manually if needed.
Be aware that the rules are shared between the `dev` and `test` applicaton.

```commandline
firebase deploy --only storage,firestore --project phaenonet-test --config=firebase-dev.json
```

### Deploy application for acceptance test

Code merged to the `master` branch will be deployed to <https://phaenonet-test.web.app/> for final acceptance. This deployment will also include all rules and indexes.

To manually deploy a test version:

```commandline
ng build --aot && firebase deploy --project phaenonet-test --config=firebase-test.json
```

## Production Deployment

```commandline
ng build --prod --aot && firebase deploy --project phaenonet --config=firebase-prod.json
```
