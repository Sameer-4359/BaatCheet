// utils/permissions.ts

import { requestMultiple, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

export async function requestMediaPermissions(): Promise<boolean> {
  const micPerm = Platform.select({
    android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    ios: PERMISSIONS.IOS.MICROPHONE,
  })!;

  const camPerm = Platform.select({
    android: PERMISSIONS.ANDROID.CAMERA,
    ios: PERMISSIONS.IOS.CAMERA,
  })!;

  const results = await requestMultiple([micPerm, camPerm]);

  const micGranted = results[micPerm] === RESULTS.GRANTED;
  const camGranted = results[camPerm] === RESULTS.GRANTED;

  return micGranted && camGranted;
}
