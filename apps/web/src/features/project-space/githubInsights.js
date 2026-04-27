const DAY_MS = 24 * 60 * 60 * 1000;

function safeDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizedAuthor(value) {
  return value?.trim() || 'Unknown';
}

function normalizeBranch(branch, defaultBranch, pullRequestsBySource) {
  const relatedPullRequests = pullRequestsBySource.get(branch.name) || [];
  const primaryPullRequest = relatedPullRequests[0] || null;
  const sourceBranch = branch.name === defaultBranch
    ? null
    : (primaryPullRequest?.targetBranch || defaultBranch || null);
  const updatedAt = safeDate(branch.lastCommitDate);

  return {
    ...branch,
    sourceBranch,
    updatedAt,
    isDefault: branch.name === defaultBranch,
    relatedPullRequests,
    latestPullRequest: primaryPullRequest,
  };
}

export function buildGitHubInsights(activity) {
  const branches = activity?.branches || [];
  const pullRequests = activity?.pullRequests || [];
  const commits = activity?.recentCommits || [];
  const defaultBranch = activity?.defaultBranch || null;

  const pullRequestsBySource = pullRequests.reduce((map, pullRequest) => {
    if (!pullRequest?.sourceBranch) return map;
    if (!map.has(pullRequest.sourceBranch)) {
      map.set(pullRequest.sourceBranch, []);
    }
    map.get(pullRequest.sourceBranch).push(pullRequest);
    return map;
  }, new Map());

  const normalizedBranches = branches
    .map(branch => normalizeBranch(branch, defaultBranch, pullRequestsBySource))
    .sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0);
    });

  const branchMap = normalizedBranches.reduce((map, branch) => {
    map.set(branch.name, branch);
    return map;
  }, new Map());

  const contributorMap = new Map();
  commits.forEach(commit => {
    const author = normalizedAuthor(commit.author);
    const current = contributorMap.get(author) || {
      author,
      commitCount: 0,
      branches: new Set(),
      latestCommitAt: null,
      latestMessage: null,
    };

    current.commitCount += 1;
    if (commit.branch) current.branches.add(commit.branch);

    const commitDate = safeDate(commit.date);
    if (commitDate && (!current.latestCommitAt || commitDate > current.latestCommitAt)) {
      current.latestCommitAt = commitDate;
      current.latestMessage = commit.message;
    }

    contributorMap.set(author, current);
  });

  pullRequests.forEach(pullRequest => {
    const author = normalizedAuthor(pullRequest.author);
    const current = contributorMap.get(author) || {
      author,
      commitCount: 0,
      branches: new Set(),
      latestCommitAt: null,
      latestMessage: null,
    };
    if (pullRequest.sourceBranch) current.branches.add(pullRequest.sourceBranch);
    current.pullRequestCount = (current.pullRequestCount || 0) + 1;
    contributorMap.set(author, current);
  });

  const contributors = Array.from(contributorMap.values())
    .map(contributor => ({
      ...contributor,
      branchCount: contributor.branches.size,
      branches: Array.from(contributor.branches),
    }))
    .sort((a, b) => {
      if (b.commitCount !== a.commitCount) return b.commitCount - a.commitCount;
      return (b.pullRequestCount || 0) - (a.pullRequestCount || 0);
    });

  const openPullRequests = pullRequests.filter(pullRequest => pullRequest.state === 'open');
  const mergedPullRequests = pullRequests.filter(pullRequest => pullRequest.state === 'merged');
  const closedPullRequests = pullRequests.filter(pullRequest => pullRequest.state === 'closed');

  const now = Date.now();
  const staleBranches = normalizedBranches.filter(branch => {
    if (branch.isDefault || !branch.updatedAt) return false;
    return now - branch.updatedAt.getTime() > 14 * DAY_MS;
  });

  const activeBranches = normalizedBranches.filter(branch => {
    if (!branch.updatedAt) return false;
    return now - branch.updatedAt.getTime() <= 7 * DAY_MS;
  });

  const totalChangedFiles = pullRequests.reduce((sum, pullRequest) => sum + (pullRequest.changedFiles || 0), 0);
  const totalAdditions = pullRequests.reduce((sum, pullRequest) => sum + (pullRequest.additions || 0), 0);
  const totalDeletions = pullRequests.reduce((sum, pullRequest) => sum + (pullRequest.deletions || 0), 0);

  return {
    branches: normalizedBranches,
    branchMap,
    pullRequests,
    commits,
    contributors,
    openPullRequests,
    mergedPullRequests,
    closedPullRequests,
    staleBranches,
    activeBranches,
    totalChangedFiles,
    totalAdditions,
    totalDeletions,
    defaultBranch,
  };
}
