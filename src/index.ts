import * as core from '@actions/core';
import * as github from '@actions/github';
import { getIssueNumbersBetweenCommits } from './utils';

const octokit = github.getOctokit(core.getInput('repo-token'));

async function run() {
  try {
    // get the current release; the release that triggered the action
    const currentRelease = github.context.payload.release;
    core.info(`current release: ${currentRelease?.name}`);
    core.debug(`currentRelease: ${JSON.stringify(currentRelease)}`);
    const releaseCommit = currentRelease?.target_commitish;
    core.info(`release commit: ${releaseCommit}`);

    const repo = {
      owner: github.context.payload.repository?.owner.login,
      repo: github.context.payload.repository?.name,
    };

    if (!repo.owner || !repo.repo) {
      throw new Error('Could not determine repository owner and name');
    }
    core.info(`repo: ${repo.owner}/${repo.repo}`);

    // get previous release (taking into account prereleases)
    const { data: releases } = await octokit.rest.repos.listReleases({
      owner: repo.owner,
      repo: repo.repo,
    });

    core.debug(`releases: ${JSON.stringify(releases)}`);
    const lastRelease = releases.find(
      (release) => release.prerelease === currentRelease.prerelease && release.id !== currentRelease.id,
    );
    core.info(`last release: ${lastRelease?.name}`);
    const lastReleaseCommit = lastRelease?.target_commitish;
    core.info(`last release commit: ${lastReleaseCommit}`);

    const issues = await getIssueNumbersBetweenCommits(octokit, lastReleaseCommit, releaseCommit, {
      owner: repo.owner,
      repo: repo.repo,
    });

    core.info(`issues: ${issues.join(', ')}`);

    // post message to issues
    for (const issue of issues) {
      await octokit.rest.issues.createComment({
        owner: repo.owner,
        repo: repo.repo,
        issue_number: parseInt(issue),
        body: `🥳 This issue is included in [${currentRelease.name}](${currentRelease.html_url})`,
      });

      core.info(`posted comment to issue: ${issue}`);
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
