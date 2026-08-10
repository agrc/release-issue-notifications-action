# Release Issue Notifications

[![Push Events](https://github.com/agrc/release-issue-notifications-action/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/release-issue-notifications-action/actions/workflows/push.yml)
[![Release Events](https://github.com/agrc/release-issue-notifications-action/actions/workflows/release.yml/badge.svg)](https://github.com/agrc/release-issue-notifications-action/actions/workflows/release.yml)

This action posts a comment on related closed or fixed issues after a release is published with a link to the release. For example:

```markdown
🥳 This issue is included in [v1.0.0](https://github.com/agrc/release-issue-notifications-action/releases/tag/v1.0.0)
```

## Usage

`release.yml`

```yaml
name: Release Events

on:
  release:
    types: [published]

jobs:
  notify:
    name: Notifications
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      issues: write

    steps:
      - name: Release Notifier
        uses: agrc/release-issue-notifications-action@v1
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}
```

## Package for Distribution

This action is built and distributed via the included GitHub action workflows.

## Local Testing

You may test some of the utilities that this action uses locally by running scripts in the `scripts` directory. For example:

```bash
npx tsx scripts/testGetIssueNumbers.ts $(gh auth token) 2a90bc980886321aca554eddc47b98c7638617b3 89327edb99c324c82aced47238c6b29e03f0a23d agrc release-issue-notifications-action
```

## Attribution

This project was developed with the assistance of [GitHub Copilot](https://github.com/features/copilot).
