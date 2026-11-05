import {Alert, Linking} from "react-native";

export const EMERGENCY_NUMBER = "112";

// Opens the phone dialer pre-filled with the emergency number; the partner still presses
// call. The app has no SOS backend yet, so this is the one real help we can offer, and
// the UI must not claim anything has been dispatched on the partner's behalf.
export const dialEmergency = () =>
  Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() =>
    Alert.alert("Call emergency services", `Please dial ${EMERGENCY_NUMBER} now.`),
  );
