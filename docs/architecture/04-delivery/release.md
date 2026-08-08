# Release

Release artifacts identify immutable source revision, lockfile, build output/image digest, target environment, and service contract compatibility. Applications may release independently only while contracts remain compatible; breaking contracts require a coordinated compatibility window and migration.

Promotion requires all [quality gates](quality-gates.md), protected environment approval where configured, smoke evidence, telemetry readiness, and a rollback target. Release notes state user-facing changes, migration requirements, and known bounded risks.
