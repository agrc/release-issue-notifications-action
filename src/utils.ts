import * as github from '@actions/github';
import issueParser from 'issue-parser';

const parse = issueParser('github');
type PaginateResponse = {
  commits: { commit: { message: string } }[];
};

export async function getIssueNumbersBetweenCommits(
  octokit: ReturnType<typeof github.getOctokit>,
  lastReleaseCommit: string | undefined,
  currentReleaseCommit: string,
  repo: { owner: string; repo: string },
): Promise<string[]> {
  let commits;
  if (!lastReleaseCommit) {
    // get all commits since the beginning of the repo on the default branch
    commits = await octokit.paginate(octokit.rest.repos.listCommits, {
      owner: repo.owner,
      repo: repo.repo,
      per_page: 100,
    });
  } else {
    const responses: PaginateResponse[] = await octokit.paginate('GET /repos/{owner}/{repo}/compare/{basehead}', {
      owner: repo.owner,
      repo: repo.repo,
      basehead: `${lastReleaseCommit}...${currentReleaseCommit}`,
      per_page: 100,
    });

    commits = responses.flatMap((response) => response.commits);
  }

  // parse commit message to get list of issue numbers
  const issues = commits
    .map((commit) => parse(commit.commit.message))
    .map((parsed) => parsed.actions.close?.map((close) => close.issue) || [])
    .flat();

  return issues;
}
