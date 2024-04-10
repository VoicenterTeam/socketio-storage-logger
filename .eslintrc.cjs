/* eslint-env node */
module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    ignorePatterns: [ 'dist', 'node_modules' ],
    extends: [
        '@voicenter-team/ts'
    ],
    env: {
        browser: true,
        node: true
    },
    rules: {
        'no-dupe-class-members': 'off'
    }
}
