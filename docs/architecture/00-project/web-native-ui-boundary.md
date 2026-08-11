# Web and Native UI Boundary

`@emme/ui` shares tokens, accessibility rules, and public component contracts where practical. Its platform boundary is explicit: `src/web` contains DOM-specific implementations and `src/native` is a future extension point.

React Native is not required by this migration. Web code must not force DOM APIs into portable contracts, and native consumers must not import `web` internals. Generic UI remains feature-free on both platforms; platform adapters own only platform mechanics.
