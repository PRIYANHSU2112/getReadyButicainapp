import {ViewStyle} from "react-native";
export const shadows: Record<string, ViewStyle> = {
  none: { shadowColor: "transparent", shadowOffset: {width:0,height:0}, shadowOpacity:0, shadowRadius:0, elevation:0 },
  xs:   { shadowColor: "#000000", shadowOffset: {width:0,height:1}, shadowOpacity:0.05, shadowRadius:2, elevation:1 },
  sm:   { shadowColor: "#000000", shadowOffset: {width:0,height:2}, shadowOpacity:0.08, shadowRadius:4, elevation:2 },
  md:   { shadowColor: "#000000", shadowOffset: {width:0,height:4}, shadowOpacity:0.12, shadowRadius:8, elevation:4 },
  lg:   { shadowColor: "#000000", shadowOffset: {width:0,height:6}, shadowOpacity:0.16, shadowRadius:16, elevation:8 },
  card: { shadowColor: "#000000", shadowOffset: {width:0,height:3}, shadowOpacity:0.07, shadowRadius:10, elevation:3 },
  floating: { shadowColor: "#0A7C4E", shadowOffset: {width:0,height:8}, shadowOpacity:0.25, shadowRadius:16, elevation:10 },
  modal: { shadowColor: "#000000", shadowOffset: {width:0,height:10}, shadowOpacity:0.25, shadowRadius:24, elevation:16 },
};
export type Shadows = typeof shadows;
