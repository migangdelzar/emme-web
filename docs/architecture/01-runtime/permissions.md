# Permissions

`@emme/core` owns frontend permission contracts, checks, and guards. Apps compose role-specific navigation and workflow decisions; features receive capabilities rather than inventing platform policy. Backend enforcement is mandatory and cannot be replaced by a hidden route or disabled control.

Permission denial produces an explicit forbidden state without leaking restricted data. Tests cover allowed, denied, changed-session, and tenant-mismatch cases, with backend contract tests proving the server remains the authority.
