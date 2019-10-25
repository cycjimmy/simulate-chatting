const makeCommonConfig = require('@cycjimmy/config-lib/semanticRelease/15.x/makeCommonConfig');

module.exports = makeCommonConfig({
  githubOptions: {
    "assets": [
      "build/simulate-chatting.min.js"
    ]
  },
  exec: true,
  execOptions: {
    publishCmd: 'npm rebuild node-sass && npm run build'
  }
});
