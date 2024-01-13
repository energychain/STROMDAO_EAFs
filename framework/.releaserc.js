module.exports = {
    branches: ['main'],
    plugins: [
      ['@semantic-release/commit-analyzer', {
        preset: 'conventionalcommits',
        releaseRules: [
          {type: 'feat', release: 'minor'},
          {type: 'fix', release: 'patch'},
          {type: 'docs', release: 'patch'},
          {type: 'style', release: 'patch'},
          {type: 'refactor', release: 'patch'},
          {type: 'perf', release: 'patch'},
          {type: 'test', release: 'patch'},
          {type: 'build', release: 'patch'},
          {type: 'ci', release: 'patch'},
          {type: 'none', release: 'patch'},
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