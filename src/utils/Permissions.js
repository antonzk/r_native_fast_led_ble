import { PermissionsAndroid } from 'react-native'

const checkLocation = async () => {
  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
      
    )
  } catch (e) {
    console.log(e);
    return false
  }
}

const requestLocation = async () => {
  try {
    return await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      {
        title: 'Location permission',
        message:
          'Bluetooth library requires Location Permission. ' +
          'Please grant it.',
        // buttonNeutral: 'Ask Me Later',
        // buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    )
  } catch (e) {
    console.log(e);
    return PermissionsAndroid.RESULTS.DENIED
  }
}

export {
  checkLocation,
  requestLocation
}