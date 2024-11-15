# PhaenoNet Client ![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/globe-swiss/phaenonet-client/test.yml?branch=master)

This project is the web-client application for the phenology observation offer [PhaenoNet](https://www.phaenonet.ch) by [GLOBE Switzerland](https://www.globe-swiss.ch).

## Environment

PhaenoNet is set up with two Firebase projects instances. These projects have a separate Firestore and storage instance as well as access rules.

- [phaenonet](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the production instance
- [phaenonet-test](https://console.firebase.google.com/u/0/project/phaenonet/overview) as the test instance

## Project Structure

This structure organizes the app into `core`, `shared`, and `domain` areas, each serving distinct purposes.

```plaintext
/
├── src/
│   ├── app/
│   │   ├── core/                     # Core application services and utilities
│   │   │   ├── components/           # Core reusable components
│   │   │   ├── providers/            # App-wide providers (e.g., global error handler)
│   │   │   ├── services/             # Singleton services (e.g., auth service)
│   │   │   ├── models/               # App-wide data models
│   │   │   └── utils/                # Utility functions and helpers
│   │   │
│   │   ├── shared/                   # Shared resources across modules
│   │   │   ├── components/           # Shared UI components
│   │   │   ├── services/             # Reusable, stateless services
│   │   │   ├── models/               # Shared data models
│   │   │   └── utils/                # Utility functions and helpers
│   │   │
│   │   ├── domains/                  # Business domains and feature areas
│   │   │   ├── auth/                 # Authentication domain
│   │   │   │   ├── feature-login/    # Specific feature, e.g., login
│   │   │   │   └── shared/           # Auth domain-specific shared items
│   │   │   ├── individual/           # Individual user-related domain
│   │   │   │   └── feature-profile/  # Feature folder for profile functions
│   │   │   ├── map/                  # Map domain
│   │   │   ├── profile/              # Profile domain
:   :   :   └── statistics/           # Statistics domain

```

### Component Naming Conventions

- **page**: Components that have a route (e.g., `login.page.ts`).
- **widget**: "Smart" components interacting with services or managing complex data (e.g., `user.widget.ts`).
- **component**: "Dumb" UI-only components that e.g. communicate via `@Input()` and `@Output()` (e.g., `button.component.ts`).

### CSS conventions

The CSS is developed according to [BEM](http://getbem.com/introduction/).

e.g.

individual-detail.component.html (with the Block `individual-detail` and the element `header`):

```html
<div class="individual-detail">
  <div class="individual-detail__header">...</div>
</div>
```

individual-detail.component.scss:

```scss
.individual-detail {
  @include detail-view &__header {
    // the `&` will be replaced with the parent selector, so this will become `individual-detail__header`
    @include left-right-padding;
  }
}
```

mixins.scss:

```scss
@mixin detail-view {
  ...
}
@mixin left-right-padding{
  ...
}
```

## Development

The application will be using the database and access rules of the `phaenonet-test` project for all use-cases described in this section.

### GitHub Codespaces

Launch the Codespace in GitHub using the `codespace` branch. It will checkout the master branch, initialize the submodules, and rebuild the container. This process may take some minutes to finish.

### Serve locally

Initially copy [init.json](https://phaenonet-test.web.app/__/firebase/init.json) credential file for local development in the `src/local/` folder.

Run a dev server.

```commandline
pnpm exec ng serve --c=local
```

Navigate to <http://localhost:4200/>. The app will automatically reload if you change any of the source files.

### Run end-to-end tests

To run e2e-test first run a local server as described in the previous chapter.

Install the required dependencies and run the tests:

```commandline
pnpm --filter e2e install
pnpm --filter e2e exec codeceptjs run --steps
```

Test output will be located in `/e2e/output`.

### Run stylelint checks

To run all `stylelint` checks

```commandline
pnpm exec stylelint "**/*.scss"
```

### Create map pins

To recreate the map_pins with the '+' install imagemagick and run the script `src/create_map_pins_with_plus_icon.sh`.

## Deploy to Firebase

Whenever possible use the GitHub action [deploy](https://github.com/globe-swiss/phaenonet-client/actions/workflows/deploy.yml) and [channel](https://github.com/globe-swiss/phaenonet-client/actions/workflows/channel.yml) to deploy applications to Firebase.

Code merged to the `master` branch will be deployed to <https://phaenonet-test.web.app/> for final acceptance. This deployment will also include all rules and indexes.

### Manually deploy applications in development

Intermediate development states of the application can be deployed to [hosting channels](https://firebase.google.com/docs/hosting/manage-hosting-resources).

```commandline
pnpm exec ng build && pnpm exec firebase hosting:channel:deploy my_channel_name --project phaenonet-test
```

### Manually deploy rules & indexes in development

Rules and indexes for Firestore and Storage will need to be deployed manually if needed.
Be aware that the rules are shared between the hosting channel and the `test` application.

```commandline
pnpm exec firebase deploy --only storage,firestore --project phaenonet-test
```

### Manually deploy application for acceptance test

To manually deploy a test version:

```commandline
pnpm exec firebase login
pnpm exec ng build && pnpm exec firebase deploy --project phaenonet-test
```

### Manually deploy application version to production

```commandline
git checkout v<version>
pnpm exec firebase login
rm -r node_modules && CI=true pnpm install && pnpm exec ng build --c=production && pnpm exec firebase deploy --project phaenonet
```

## Related resources

- [phaenonet-functions](https://github.com/globe-swiss/phaenonet-functions)
- [data model documentation](https://dbdocs.io/pgoellnitz/phaenonet) ([dbdiagrams.io](http://dbdiagrams.io))
