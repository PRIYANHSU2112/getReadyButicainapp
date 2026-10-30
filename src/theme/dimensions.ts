import {Dimensions, Platform} from "react-native";
const {width, height} = Dimensions.get("window");
export const dimensions = {
  window: {width, height},
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
  headerHeight: Platform.OS === "ios" ? 44 : 56,
  bottomBarHeight: Platform.OS === "ios" ? 76 : 64,
  buttonHeight: 48,
  buttonHeightSmall: 36,
  buttonHeightLarge: 54,
  inputHeight: 52,
  avatarSize: {sm: 32, md: 44, lg: 60, xl: 88},
};
export type DimensionsToken = typeof dimensions;
