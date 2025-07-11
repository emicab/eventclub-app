import 'dotenv/config';

export default {
  "expo": {
    "name": "eventclub-app",
    "slug": "eventclub-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "eventclubapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.anonymous.eventclubapp"
    },
    "web": {
      "bundler": "metro",
      "output": "static",
      "favicon": "./assets/images/favicon.png"
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-web-browser",
      "expo-localization",
      "expo-location"
    ],
    "experiments": {
      "typedRoutes": true
    },
    "extra": {
      "router": {},
      "eas": {
        "projectId": "f0db90d4-15b6-4966-9d95-caa3c2d2e818"
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.eventclub.app",
      apiKey: process.env.EXPO_PUBLIC_API_KEY,
      apiExchange: process.env.EXPO_PUBLIC_KEY_EXCHANGE
    }
  }
}
