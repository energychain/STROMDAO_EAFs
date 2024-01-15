module.exports = {
  branches: ['main'],
  plugins: [
    ['@semantic-release/commit-analyzer', {
      preset: 'angular',
      releaseRules: [
        {type: 'increment', release: 'patch'},
        {type: 'Increment', release: 'patch'},
        {type: 'feat', release: 'patch'},
        {type: 'Feat', release: 'patch'},
        {type: 'fix', release: 'patch'},
        {type: 'Fix', release: 'patch'},
        {type: 'docs', release: 'patch'},
        {type: 'Docs', release: 'patch'},
        {type: 'Patch', release: 'patch'},
        {type: 'style', release: 'patch'},
        {type: 'refactor', release: 'patch'},
        {type: 'perf', release: 'patch'},
        {type: 'test', release: 'patch'},
        {type: 'build', release: 'minor'},
        {type: 'ci', release: 'patch'},
        {type: 'revert', release: 'patch'},
      ],
    }],
    ['@semantic-release/release-notes-generator', {
      preset: 'conventionalcommits',
      writerOpts: {
        commitsSort: ['subject', 'scope'],
      },
    }],
    ['@semantic-release/changelog', {
      changelogFile: 'CHANGELOG.md',
    }],
    ['@semantic-release/npm', {}],
    ['@semantic-release/github', {
      assets: [
        {path: 'CHANGELOG.md', label: 'Changelog'},
      ],
    }],
  ],
};