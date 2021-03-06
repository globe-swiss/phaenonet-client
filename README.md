# PhaenoNet Client ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/globe-swiss/phaenonet-client/Build) ![GitHub Workflow Status](https://img.shields.io/github/workflow/status/globe-swiss/phaenonet-client/Run%20end-to-end%20tests?label=e2e-tests) [![Codacy Badge](https://app.codacy.com/project/badge/Grade/c51ab6cad950470a8ffb99c969041b09)](https://www.codacy.com/gh/globe-swiss/phaenonet-client/dashboard?utm_source=github.com&utm_medium=referral&utm_content=globe-swiss/phaenonet-client&utm_campaign=Badge_Grade)

This project is the web-client application for the phenology observation offer [PhaenoNet](https://www.phaenonet.ch) by [GLOBE Switzerland](https://www.globe-swiss.ch).

## Environment

PhaenoNet is set up with two Firebase projects instances. These projects have a separate Firestore and storage instance as well as access rules.

- [phaenonet](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the production instance
- [phaenonet-test](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the test instance

### Server side setup

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

## Development

The application will be using the database and access rules of the `phaenonet-test` project for all use-cases described in this section.

### Local setup

Install Node.js and npm see: <https://www.npmjs.com/get-npm>

Install the Firebase console and login:

```commandline
npm install
npx firebase login
```

Consult the official documentation for the [Firebase CLI](https://firebase.google.com/docs/cli) for further information.

API information [init.json](https://phaenonet-test.web.app/__/firebase/init.json) must be copied to the folder `/app/src/local/`.

Firestore and Storage rules need to be checked out from a separate project [phaenonet-client-security](https://github.com/globe-swiss/phaenonet-client-security) into the `/security` folder.

### Serve locally

Initially copy [init.json](https://phaenonet-test.web.app/__/firebase/init.json) credential file for local development in the `src/local/` folder.

Run a dev server.

```commandline
npx ng serve --c=local
```

Navigate to <http://localhost:4200/>. The app will automatically reload if you change any of the source files.

### Run end-to-end tests

To run e2e-test first run a local server as described in the previous chapter.

Install the required dependencies

```commandline
cd e2e
npm install
```

and run the tests with `codeceptjs` e.g.

```commandline
npx codeceptjs run --steps
```

Test output will be located in `/e2e/output`.

## Deploy to Firebase

Whenever possible use the GitHub action [deploy](https://github.com/globe-swiss/phaenonet-client/actions/workflows/deploy.yml) and [channel](https://github.com/globe-swiss/phaenonet-client/actions/workflows/channel.yml) to deploy applications to Firebase.

Code merged to the `master` branch will be deployed to <https://phaenonet-test.web.app/> for final acceptance. This deployment will also include all rules and indexes.

### Manually deploy applications in development

Intermediate development states of the application can be deployed to [hosting channels](https://firebase.google.com/docs/hosting/manage-hosting-resources).

```commandline
npx ng build && npx firebase hosting:channel:deploy my_channel_name --project phaenonet-test
```

### Manually deploy rules & indexes in development

Rules and indexes for Firestore and Storage will need to be deployed manually if needed.
Be aware that the rules are shared between the hosting channel and the `test` application.

```commandline
npx firebase deploy --only storage,firestore --project phaenonet-test
```

### Manually deploy application for acceptance test

To manually deploy a test version:

```commandline
npx ng build && npx firebase deploy --project phaenonet-test
```

### Manually deploy application to production

```commandline
npx ng build --prod && npx firebase deploy --project phaenonet
```

## Related resources

- [phaenonet-functions](https://github.com/globe-swiss/phaenonet-functions)
- [data model documentation](https://dbdocs.io/pgoellnitz/phaenonet)
