module.exports = {
  project: {
    ios: {},
    android: {},
  },
  dependencies: {
    '@invertase/react-native-apple-authentication': {
      platforms: {android: null, ios: null},
    },
    // PocketPal Lite has no camera, speech, purchase, or cloud-auth features.
    'react-native-vision-camera': {platforms: {android: null, ios: null}},
    '@fugood/react-native-audio-pcm-stream': {
      platforms: {android: null, ios: null},
    },
    '@pocketpalai/react-native-speech': {platforms: {android: null, ios: null}},
    '@pocketpalai/react-native-speech-phonon': {
      platforms: {android: null, ios: null},
    },
    'whisper.rn': {platforms: {android: null, ios: null}},
    'react-native-iap': {platforms: {android: null, ios: null}},
    '@react-native-firebase/app': {platforms: {android: null, ios: null}},
    '@react-native-firebase/app-check': {platforms: {android: null, ios: null}},
    '@react-native-google-signin/google-signin': {
      platforms: {android: null, ios: null},
    },
  },
  assets: ['./src/assets/fonts'],
};
