const API = 'https://api.github.com';

function env(name) {
  const v = process.env[name];
  if (!v) throw new Error('Missing environment variable: ' + name);
  return v;
}

async function gh(path, options = {}) {
  const token = env('GITHUB_TOKEN');
  const res = await fetch(API + path, {
    ...options,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error('GitHub API ' + path + ' failed (' + res.status + '): ' + text);
  }
  return res.json();
}

// Commits `files` (each { path, content, encoding: 'utf-8' | 'base64' }) as
// a single new commit on the configured branch, using the Git Data API so
// several files land in one push (and therefore one Netlify deploy) instead
// of one commit per file.
export async function commitFiles(files, message) {
  const owner = env('GITHUB_OWNER');
  const repo = env('GITHUB_REPO');
  const branch = process.env.GITHUB_BRANCH || 'main';
  const base = '/repos/' + owner + '/' + repo;

  const ref = await gh(base + '/git/ref/heads/' + branch);
  const latestCommitSha = ref.object.sha;
  const latestCommit = await gh(base + '/git/commits/' + latestCommitSha);
  const baseTreeSha = latestCommit.tree.sha;

  const treeEntries = [];
  for (const file of files) {
    const blob = await gh(base + '/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content: file.content, encoding: file.encoding }),
    });
    treeEntries.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }

  const tree = await gh(base + '/git/trees', {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseTreeSha, tree: treeEntries }),
  });

  const commit = await gh(base + '/git/commits', {
    method: 'POST',
    body: JSON.stringify({ message, tree: tree.sha, parents: [latestCommitSha] }),
  });

  await gh(base + '/git/refs/heads/' + branch, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha }),
  });

  return commit.sha;
}
