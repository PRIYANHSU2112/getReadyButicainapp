import {TextStyle, Platform} from "react-native";

export const fontFamilies = {
  regular:   Platform.select({ios:"System", android:"sans-serif",       default:"sans-serif"}),
  medium:    Platform.select({ios:"System", android:"sans-serif-medium", default:"sans-serif-medium"}),
  semiBold:  Platform.select({ios:"System", android:"sans-serif-medium", default:"sans-serif-medium"}),
  bold:      Platform.select({ios:"System", android:"sans-serif-black",  default:"sans-serif"}),
  extraBold: Platform.select({ios:"System", android:"sans-serif-black",  default:"sans-serif"}),
  serif:     Platform.select({ios:"Georgia", android:"serif",            default:"serif"}),
};

export const typography: Record<string, TextStyle> = {
  displayLarge: {fontFamily:fontFamilies.bold, fontSize:34, lineHeight:44, fontWeight:"800", letterSpacing:-0.5},
  display:      {fontFamily:fontFamilies.bold, fontSize:30, lineHeight:40, fontWeight:"800", letterSpacing:-0.4},
  h1:           {fontFamily:fontFamilies.bold, fontSize:24, lineHeight:32, fontWeight:"700", letterSpacing:-0.3},
  h2:           {fontFamily:fontFamilies.bold, fontSize:20, lineHeight:28, fontWeight:"700", letterSpacing:-0.2},
  h3:           {fontFamily:fontFamilies.semiBold, fontSize:18, lineHeight:24, fontWeight:"700", letterSpacing:-0.2},
  title:        {fontFamily:fontFamilies.bold, fontSize:16, lineHeight:22, fontWeight:"700", letterSpacing:-0.1},
  // h4/body1/body2/captionSmall are referenced across screens and shared components
  // (Input, Badge, ...) but were never defined, so their styles silently dropped.
  h4:           {fontFamily:fontFamilies.bold, fontSize:16, lineHeight:22, fontWeight:"700", letterSpacing:-0.1},
  subtitle:     {fontFamily:fontFamilies.medium, fontSize:14, lineHeight:20, fontWeight:"500"},
  body:         {fontFamily:fontFamilies.regular, fontSize:14, lineHeight:20, fontWeight:"400"},
  body1:        {fontFamily:fontFamilies.regular, fontSize:14, lineHeight:20, fontWeight:"400"},
  bodyMedium:   {fontFamily:fontFamilies.medium, fontSize:14, lineHeight:20, fontWeight:"600"},
  bodySmall:    {fontFamily:fontFamilies.regular, fontSize:12.5, lineHeight:18, fontWeight:"400"},
  body2:        {fontFamily:fontFamilies.regular, fontSize:12.5, lineHeight:18, fontWeight:"400"},
  caption:      {fontFamily:fontFamilies.regular, fontSize:11, lineHeight:15, fontWeight:"500", letterSpacing:0.3},
  captionSmall: {fontFamily:fontFamilies.regular, fontSize:10, lineHeight:14, fontWeight:"600", letterSpacing:0.3},
  label:        {fontFamily:fontFamilies.semiBold, fontSize:11.5, lineHeight:16, fontWeight:"700", letterSpacing:0.6},
  button:       {fontFamily:fontFamilies.semiBold, fontSize:15, lineHeight:20, fontWeight:"700", letterSpacing:0.2},
  buttonSmall:  {fontFamily:fontFamilies.semiBold, fontSize:13, lineHeight:16, fontWeight:"600"},
  input:        {fontFamily:fontFamilies.regular, fontSize:15, lineHeight:20, fontWeight:"400"},
  currencyHero: {fontFamily:fontFamilies.bold, fontSize:34, lineHeight:44, fontWeight:"800", letterSpacing:-0.5},
  pillBadge:    {fontFamily:fontFamilies.bold, fontSize:10.5, lineHeight:14, fontWeight:"800", letterSpacing:0.4, textTransform:"uppercase"},
};

export type TypographyVariant = keyof typeof typography;
