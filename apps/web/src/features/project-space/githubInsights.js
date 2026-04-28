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
    relatedCommits: [],
    children: [],
    depth: 0,
  };
}

function buildBranchTree(branches, branchMap, defaultBranch) {
  const roots = [];

  branches.forEach(branch => {
    branch.children = [];
    branch.depth = 0;
  });

  branches.forEach(branch => {
    const parentName = branch.sourceBranch;
    const parent = parentName ? branchMap.get(parentName) : null;

    if (!parent || parent.name === branch.name) {
      roots.push(branch);
      return;
    }

    parent.children.push(branch);
    branch.depth = parent.depth + 1;
  });

  if (!roots.length && defaultBranch && branchMap.has(defaultBranch)) {
    roots.push(branchMap.get(defaultBranch));
  }

  const seen = new Set();
  const dedupedRoots = [];

  roots.forEach(root => {
    if (!seen.has(root.name)) {
      seen.add(root.name);
      dedupedRoots.push(root);
    }
  });

  branches.forEach(branch => {
    if (!seen.has(branch.name)) {
      seen.add(branch.name);
      dedupedRoots.push(branch);
    }
  });

  const assignDepth = (node, depth, path = new Set()) => {
    if (path.has(node.name)) return;
    node.depth = depth;
    const nextPath = new Set(path);
    nextPath.add(node.name);
    node.children.sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
    node.children.forEach(child => assignDepth(child, depth + 1, nextPath));
  };

  dedupedRoots.forEach(root => assignDepth(root, 0));
  return dedupedRoots;
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

  const enrichedPullRequests = pullRequests
    .map(pullRequest => ({
      ...pullRequest,
      relatedCommits: commits.filter(commit => commit.branch && commit.branch === pullRequest.sourceBranch),
    }))
    .sort((a, b) => {
      const aDate = safeDate(a.createdAt)?.getTime() || 0;
      const bDate = safeDate(b.createdAt)?.getTime() || 0;
      return bDate - aDate;
    });

  const pullRequestsBySourceBranch = enrichedPullRequests.reduce((map, pullRequest) => {
    if (!pullRequest?.sourceBranch) return map;
    if (!map.has(pullRequest.sourceBranch)) {
      map.set(pullRequest.sourceBranch, []);
    }
    map.get(pullRequest.sourceBranch).push(pullRequest);
    return map;
  }, new Map());

  const enrichedCommits = commits
    .map(commit => ({
      ...commit,
      relatedPullRequests: pullRequestsBySourceBranch.get(commit.branch) || [],
    }))
    .sort((a, b) => {
      const aDate = safeDate(a.date)?.getTime() || 0;
      const bDate = safeDate(b.date)?.getTime() || 0;
      return bDate - aDate;
    });

  normalizedBranches.forEach(branch => {
    branch.relatedCommits = [];
  });

  enrichedCommits.forEach(commit => {
    if (!commit?.branch) return;
    const branch = branchMap.get(commit.branch);
    if (!branch) return;
    branch.relatedCommits.push(commit);
  });

  const contributorMap = new Map();
  enrichedCommits.forEach(commit => {
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

  const openPullRequests = enrichedPullRequests.filter(pullRequest => pullRequest.state === 'open');
  const mergedPullRequests = enrichedPullRequests.filter(pullRequest => pullRequest.state === 'merged');
  const closedPullRequests = enrichedPullRequests.filter(pullRequest => pullRequest.state === 'closed');

  const now = Date.now();
  const staleBranches = normalizedBranches.filter(branch => {
    if (branch.isDefault || !branch.updatedAt) return false;
    return now - branch.updatedAt.getTime() > 14 * DAY_MS;
  });

  const activeBranches = normalizedBranches.filter(branch => {
    if (!branch.updatedAt) return false;
    return now - branch.updatedAt.getTime() <= 7 * DAY_MS;
  });

  normalizedBranches.forEach(branch => {
    const branchContributors = new Set(branch.relatedCommits.map(commit => normalizedAuthor(commit.author)));
    branch.activeContributorCount = branchContributors.size;
    branch.linkedOpenPullRequestCount = branch.relatedPullRequests.filter(pullRequest => pullRequest.state === 'open').length;
  });

  const totalChangedFiles = enrichedPullRequests.reduce((sum, pullRequest) => sum + (pullRequest.changedFiles || 0), 0);
  const totalAdditions = enrichedPullRequests.reduce((sum, pullRequest) => sum + (pullRequest.additions || 0), 0);
  const totalDeletions = enrichedPullRequests.reduce((sum, pullRequest) => sum + (pullRequest.deletions || 0), 0);
  const branchTree = buildBranchTree(normalizedBranches, branchMap, defaultBranch);

  return {
    branches: normalizedBranches,
    branchTree,
    branchMap,
    pullRequests: enrichedPullRequests,
    commits: enrichedCommits,
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
