import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

export async function requestMediaPermissions(): Promise<boolean> {
  try {
    const micPermission = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.RECORD_AUDIO,
        ios: PERMISSIONS.IOS.MICROPHONE,
      })!
    );

    const camPermission = await request(
      Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      })!
    );

    return micPermission === RESULTS.GRANTED && camPermission === RESULTS.GRANTED;
  } catch (error) {
    console.warn('Permission request error', error);
    return false;
  }
}
