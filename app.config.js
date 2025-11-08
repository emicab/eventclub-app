import 'dotenv/config';

export default {
  "expo": {
    "name": "elbarrio-app",
    "slug": "elbarrio-app",
    "version": "0.5.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "elbarrioapp",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.anonymous.elbarrioapp",
      "config": {
        "googleMapsApiKey": "AIzaSyAqfNQMmioNDzqoek6oOmKDVMv95-8FvFQ"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#00A0FF"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.anonymous.elbarrioapp",
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyAqfNQMmioNDzqoek6oOmKDVMv95-8FvFQ"
        }
      }

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
          "backgroundColor": "#00A0FF"
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
        "projectId": "69df58f8-08db-4251-9615-3c5c5b4debcb"
      },
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://api.eventclub.app",
      apiKey: process.env.EXPO_PUBLIC_API_KEY,
      apiExchange: process.env.EXPO_PUBLIC_KEY_EXCHANGE
    }
  }
}
