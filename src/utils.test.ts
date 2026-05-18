import { describe, expect, it, vi } from 'vitest';
import { getIssueNumbersBetweenCommits } from './utils';

type OctokitClient = Parameters<typeof getIssueNumbersBetweenCommits>[0];

describe('getIssueNumbersBetweenCommits', () => {
  it('uses full commit history when there is no previous release', async () => {
    const listCommits = vi.fn();
    const paginate = vi
      .fn()
      .mockResolvedValue([
        { commit: { message: 'Fixes #12' } },
        { commit: { message: 'no issue here' } },
        { commit: { message: 'closes #34' } },
      ]);
    const octokit = {
      paginate,
      rest: {
        repos: {
          compareCommitsWithBasehead: vi.fn(),
          listCommits,
        },
      },
    } as unknown as OctokitClient;

    const issues = await getIssueNumbersBetweenCommits(octokit, undefined, 'release-sha', {
      owner: 'agrc',
      repo: 'release-issue-notifications-action',
    });

    expect(issues).toEqual(['12', '34']);
    expect(paginate).toHaveBeenCalledWith(listCommits, {
      owner: 'agrc',
      repo: 'release-issue-notifications-action',
      per_page: 100,
    });
  });

  it('uses the compare endpoint when there is a previous release', async () => {
    const paginate = vi.fn().mockImplementation(async (_route, _params, mapFn) => {
      return mapFn(
        {
          data: {
            commits: [{ commit: { message: 'Resolves #56' } }],
          },
        },
        vi.fn(),
      );
    });
    const octokit = {
      paginate,
      rest: {
        repos: {
          compareCommitsWithBasehead: vi.fn(),
          listCommits: vi.fn(),
        },
      },
    } as unknown as OctokitClient;

    const issues = await getIssueNumbersBetweenCommits(octokit, 'previous-sha', 'release-sha', {
      owner: 'agrc',
      repo: 'release-issue-notifications-action',
    });

    expect(issues).toEqual(['56']);
    expect(paginate).toHaveBeenCalledWith(
      'GET /repos/{owner}/{repo}/compare/{basehead}',
      {
        owner: 'agrc',
        repo: 'release-issue-notifications-action',
        basehead: 'previous-sha...release-sha',
        per_page: 100,
      },
      expect.any(Function),
    );
  });
});
