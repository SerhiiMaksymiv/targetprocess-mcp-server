Publish a new version of this npm package by following these steps in order:

1. Read `package.json` and find the current `version` field.
2. Increment the **patch** version (e.g. `1.0.6` → `1.0.7`). If the user specified a version bump type ("major", "minor", or "patch") in their message, use that instead.
3. Write the updated version back to `package.json`.
4. Run `npm run build` and confirm it succeeds.
5. After the user confirms publish succeeded, commit the version bump: `git add . && git commit -m "chore: bump version to <new-version>"`.

Always show the old and new version before making any changes so the user can confirm.
