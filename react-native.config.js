module.exports = {
  project: {
    android: {},
  },
  dependencies: {
    '@invertase/react-native-apple-authentication': {
    },
    // PocketPal Lite has no camera, speech, purchase, or cloud-auth features.
    '@react-native-google-signin/google-signin': {
    },
  },
  assets: ['./src/assets/fonts'],
};
