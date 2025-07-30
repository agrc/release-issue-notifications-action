import { Octokit } from '@octokit/core';
import { paginateRest } from '@octokit/plugin-paginate-rest';
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods';
import { getIssueNumbersBetweenCommits } from '../src/utils';

const token = process.argv[2];
const lastReleaseCommit = process.argv[3] === 'null' ? undefined : process.argv[3];
const currentReleaseCommit = process.argv[4];
const owner = process.argv[5];
const repo = process.argv[6];

console.log(`token: ${token}`);
console.log(`lastReleaseCommit: ${lastReleaseCommit}`);
console.log(`currentReleaseCommit: ${currentReleaseCommit}`);
console.log(`owner: ${owner}`);
console.log(`repo: ${repo}`);

const GitHub = Octokit.plugin(restEndpointMethods, paginateRest);
const octokit = new GitHub({ auth: token });

async function run() {
  const issues = await getIssueNumbersBetweenCommits(octokit, lastReleaseCommit, currentReleaseCommit, { owner, repo });
  console.log(issues);
}

run();
