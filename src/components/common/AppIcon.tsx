import React from "react";
import {StyleSheet, View, Text, ViewStyle} from "react-native";

export type AppIconName =
  | "edit-profile"
  | "performance"
  | "services"
  | "scissors"
  | "documents"
  | "privacy"
  | "bank"
  | "faq"
  | "emergency"
  | "support"
  | "language"
  | "dark-mode"
  | "app-version"
  | "logout"
  | "clock"
  | "calendar"
  | "attendance"
  | "leaves"
  | "apply-leave"
  | "salary"
  | "phone"
  | "email"
  | "chat"
  | "whatsapp"
  | "search"
  | "trash"
  | "user"
  | "chevron-right"
  | "check"
  | "download"
  | "location"
  | "camera"
  | "wallet"
  | "umbrella"
  | "first-aid"
  | "info";

interface AppIconProps {
  name: AppIconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const AppIcon: React.FC<AppIconProps> = React.memo(({
  name,
  size = 22,
  color = "#114B3E",
  style,
}) => {
  const strokeWidth = Math.max(1.6, size * 0.08);

  switch (name) {
    case "scissors":
    case "services":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Crossed blades */}
          <View
            style={[
              styles.blade,
              {
                backgroundColor: color,
                width: size * 0.85,
                height: strokeWidth,
                transform: [{rotate: "45deg"}],
              },
            ]}
          />
          <View
            style={[
              styles.blade,
              {
                backgroundColor: color,
                width: size * 0.85,
                height: strokeWidth,
                transform: [{rotate: "-45deg"}],
              },
            ]}
          />
          {/* Finger loops */}
          <View
            style={[
              styles.fingerLoop,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: (size * 0.35) / 2,
                bottom: 1,
                left: 1,
              },
            ]}
          />
          <View
            style={[
              styles.fingerLoop,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.35,
                height: size * 0.35,
                borderRadius: (size * 0.35) / 2,
                bottom: 1,
                right: 1,
              },
            ]}
          />
        </View>
      );

    case "clock":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.88,
                borderRadius: (size * 0.88) / 2,
              },
            ]}
          >
            {/* Center dot */}
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.5,
                  height: strokeWidth * 1.5,
                  borderRadius: strokeWidth,
                },
              ]}
            />
            {/* Hour hand */}
            <View
              style={[
                styles.handHour,
                {
                  backgroundColor: color,
                  width: strokeWidth,
                  height: size * 0.28,
                  top: size * 0.16,
                },
              ]}
            />
            {/* Minute hand */}
            <View
              style={[
                styles.handMinute,
                {
                  backgroundColor: color,
                  width: size * 0.24,
                  height: strokeWidth,
                  left: size * 0.42,
                  top: size * 0.42,
                },
              ]}
            />
          </View>
        </View>
      );

    case "edit-profile":
    case "leaves":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Open notebook book with spine */}
          <View
            style={[
              styles.openBook,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.68,
                borderRadius: 3,
              },
            ]}
          >
            {/* Vertical spine divider */}
            <View
              style={[
                styles.bookSpine,
                {
                  backgroundColor: color,
                  width: strokeWidth,
                  height: "100%",
                },
              ]}
            />
            {/* Page horizontal text lines */}
            <View style={styles.bookLinesContainer}>
              <View
                style={[
                  styles.bookLine,
                  {backgroundColor: color, height: strokeWidth * 0.8, width: size * 0.24},
                ]}
              />
              <View
                style={[
                  styles.bookLine,
                  {backgroundColor: color, height: strokeWidth * 0.8, width: size * 0.18, marginTop: 2},
                ]}
              />
            </View>
          </View>
        </View>
      );

    case "performance":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Speedometer semi-circle arc */}
          <View
            style={[
              styles.speedometerArc,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.52,
                borderTopLeftRadius: size * 0.44,
                borderTopRightRadius: size * 0.44,
                borderBottomWidth: 0,
              },
            ]}
          >
            {/* Needle */}
            <View
              style={[
                styles.needle,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.2,
                  height: size * 0.32,
                  bottom: 0,
                  transform: [{rotate: "40deg"}],
                },
              ]}
            />
            {/* Center pivot dot */}
            <View
              style={[
                styles.pivotDot,
                {
                  backgroundColor: color,
                  width: strokeWidth * 2.2,
                  height: strokeWidth * 2.2,
                  borderRadius: strokeWidth * 1.1,
                  bottom: -strokeWidth,
                },
              ]}
            />
          </View>
        </View>
      );

    case "documents":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Certificate paper sheet */}
          <View
            style={[
              styles.certSheet,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.82,
                height: size * 0.88,
                borderRadius: 3,
              },
            ]}
          >
            {/* Header seal circle */}
            <View
              style={[
                styles.certSeal,
                {
                  borderColor: color,
                  borderWidth: strokeWidth * 0.9,
                  width: size * 0.28,
                  height: size * 0.28,
                  borderRadius: (size * 0.28) / 2,
                },
              ]}
            />
            {/* Text lines */}
            <View
              style={[
                styles.certLine,
                {backgroundColor: color, width: size * 0.5, height: strokeWidth * 0.9, marginTop: 4},
              ]}
            />
            <View
              style={[
                styles.certLine,
                {backgroundColor: color, width: size * 0.35, height: strokeWidth * 0.9, marginTop: 2},
              ]}
            />
          </View>
        </View>
      );

    case "privacy":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Shield shape */}
          <View
            style={[
              styles.shieldBody,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.82,
                height: size * 0.88,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
                borderBottomLeftRadius: size * 0.42,
                borderBottomRightRadius: size * 0.42,
              },
            ]}
          >
            {/* Center check or lock bar */}
            <View
              style={[
                styles.shieldKeyhole,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.5,
                  height: size * 0.3,
                  borderRadius: strokeWidth,
                },
              ]}
            />
          </View>
        </View>
      );

    case "bank":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Pediment roof triangle */}
          <View
            style={[
              styles.pediment,
              {
                borderBottomColor: color,
                borderLeftWidth: size * 0.42,
                borderRightWidth: size * 0.42,
                borderBottomWidth: size * 0.22,
              },
            ]}
          />
          {/* Entablature beam */}
          <View
            style={[
              styles.bankBeam,
              {
                backgroundColor: color,
                width: size * 0.85,
                height: strokeWidth,
                marginTop: 1,
              },
            ]}
          />
          {/* 3 Pillars */}
          <View style={[styles.pillarsRow, {width: size * 0.72, height: size * 0.36}]}>
            <View style={[styles.pillar, {backgroundColor: color, width: strokeWidth}]} />
            <View style={[styles.pillar, {backgroundColor: color, width: strokeWidth}]} />
            <View style={[styles.pillar, {backgroundColor: color, width: strokeWidth}]} />
          </View>
          {/* Base foundation line */}
          <View
            style={[
              styles.bankBase,
              {
                backgroundColor: color,
                width: size * 0.88,
                height: strokeWidth * 1.2,
                borderRadius: 1,
              },
            ]}
          />
        </View>
      );

    case "faq":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.88,
                borderRadius: (size * 0.88) / 2,
              },
            ]}
          >
            <Text
              style={[
                styles.faqQMark,
                {
                  color: color,
                  fontSize: size * 0.52,
                  lineHeight: size * 0.6,
                },
              ]}
            >
              ?
            </Text>
          </View>
        </View>
      );

    case "emergency":
    case "apply-leave":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Bell body */}
          <View
            style={[
              styles.bellBody,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.68,
                height: size * 0.64,
                borderTopLeftRadius: size * 0.34,
                borderTopRightRadius: size * 0.34,
                borderBottomWidth: 0,
              },
            ]}
          />
          {/* Bell bottom rim bar */}
          <View
            style={[
              styles.bellRim,
              {
                backgroundColor: color,
                width: size * 0.82,
                height: strokeWidth * 1.2,
                borderRadius: 1,
              },
            ]}
          />
          {/* Clapper dot */}
          <View
            style={[
              styles.bellClapper,
              {
                backgroundColor: color,
                width: strokeWidth * 2,
                height: strokeWidth * 1.8,
                borderRadius: strokeWidth,
                marginTop: 1,
              },
            ]}
          />
        </View>
      );

    case "support":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Headband arc */}
          <View
            style={[
              styles.headband,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.84,
                height: size * 0.65,
                borderTopLeftRadius: size * 0.42,
                borderTopRightRadius: size * 0.42,
                borderBottomWidth: 0,
              },
            ]}
          />
          {/* Ear pads left & right */}
          <View
            style={[
              styles.earpad,
              {
                backgroundColor: color,
                width: strokeWidth * 1.8,
                height: size * 0.32,
                borderRadius: strokeWidth,
                left: size * 0.08,
                bottom: size * 0.12,
              },
            ]}
          />
          <View
            style={[
              styles.earpad,
              {
                backgroundColor: color,
                width: strokeWidth * 1.8,
                height: size * 0.32,
                borderRadius: strokeWidth,
                right: size * 0.08,
                bottom: size * 0.12,
              },
            ]}
          />
          {/* Microphone boom */}
          <View
            style={[
              styles.micBoom,
              {
                borderColor: color,
                borderWidth: strokeWidth * 0.8,
                width: size * 0.28,
                height: size * 0.22,
                borderTopWidth: 0,
                borderLeftWidth: 0,
                borderRadius: 2,
                right: size * 0.12,
                bottom: size * 0.04,
              },
            ]}
          />
        </View>
      );

    case "language":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Outer circle */}
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.88,
                borderRadius: (size * 0.88) / 2,
              },
            ]}
          >
            {/* Equator horizontal line */}
            <View
              style={[
                styles.globeEquator,
                {
                  backgroundColor: color,
                  width: "100%",
                  height: strokeWidth * 0.8,
                },
              ]}
            />
            {/* Meridian ellipse */}
            <View
              style={[
                styles.globeMeridian,
                {
                  borderColor: color,
                  borderWidth: strokeWidth * 0.8,
                  width: size * 0.46,
                  height: size * 0.88,
                  borderRadius: (size * 0.46) / 2,
                },
              ]}
            />
          </View>
        </View>
      );

    case "dark-mode":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Crescent moon / sun star */}
          <View
            style={[
              styles.crescentMoon,
              {
                width: size * 0.74,
                height: size * 0.74,
                borderRadius: (size * 0.74) / 2,
                borderColor: color,
                borderWidth: strokeWidth,
                borderRightWidth: strokeWidth * 2.8,
              },
            ]}
          />
        </View>
      );

    case "app-version":
    case "info":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.88,
                borderRadius: (size * 0.88) / 2,
              },
            ]}
          >
            {/* Info dot */}
            <View
              style={[
                styles.infoDot,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.3,
                  height: strokeWidth * 1.3,
                  borderRadius: strokeWidth,
                  marginBottom: 2,
                },
              ]}
            />
            {/* Info bar */}
            <View
              style={[
                styles.infoBar,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.2,
                  height: size * 0.32,
                  borderRadius: 1,
                },
              ]}
            />
          </View>
        </View>
      );

    case "logout":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Open doorway 3-sided border */}
          <View
            style={[
              styles.doorway,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                borderRightWidth: 0,
                width: size * 0.65,
                height: size * 0.82,
                borderRadius: 2,
                left: 1,
              },
            ]}
          />
          {/* Exit arrow */}
          <View style={[styles.arrowContainer, {right: 1}]}>
            <View
              style={[
                styles.arrowShaft,
                {
                  backgroundColor: color,
                  width: size * 0.44,
                  height: strokeWidth,
                },
              ]}
            />
            <Text
              style={[
                styles.arrowHeadText,
                {
                  color: color,
                  fontSize: size * 0.5,
                  lineHeight: size * 0.52,
                  marginLeft: -strokeWidth,
                },
              ]}
            >
              ›
            </Text>
          </View>
        </View>
      );

    case "calendar":
    case "attendance":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Top binder clips */}
          <View style={[styles.calendarBinderRow, {width: size * 0.55}]}>
            <View style={[styles.clip, {backgroundColor: color, width: strokeWidth * 1.2, height: size * 0.18}]} />
            <View style={[styles.clip, {backgroundColor: color, width: strokeWidth * 1.2, height: size * 0.18}]} />
          </View>
          {/* Calendar body */}
          <View
            style={[
              styles.calendarBox,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.85,
                height: size * 0.74,
                borderRadius: 4,
                marginTop: -1,
              },
            ]}
          >
            {/* Top header bar */}
            <View
              style={[
                styles.calendarBar,
                {
                  backgroundColor: color,
                  height: size * 0.18,
                  width: "100%",
                },
              ]}
            />
            {/* Grid dots */}
            <View style={styles.calendarDotsRow}>
              <View style={[styles.calDot, {backgroundColor: color, width: strokeWidth * 1.2, height: strokeWidth * 1.2}]} />
              <View style={[styles.calDot, {backgroundColor: color, width: strokeWidth * 1.2, height: strokeWidth * 1.2}]} />
              <View style={[styles.calDot, {backgroundColor: color, width: strokeWidth * 1.2, height: strokeWidth * 1.2}]} />
            </View>
          </View>
        </View>
      );

    case "salary":
    case "wallet":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Wallet box */}
          <View
            style={[
              styles.walletBody,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.9,
                height: size * 0.68,
                borderRadius: 4,
              },
            ]}
          >
            {/* Clasp */}
            <View
              style={[
                styles.walletClasp,
                {
                  borderColor: color,
                  borderWidth: strokeWidth * 0.9,
                  backgroundColor: "#FFFFFF",
                  width: size * 0.22,
                  height: size * 0.22,
                  borderRadius: (size * 0.22) / 2,
                  right: 2,
                },
              ]}
            />
          </View>
        </View>
      );

    case "umbrella":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Umbrella canopy dome */}
          <View
            style={[
              styles.umbrellaDome,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.48,
                borderTopLeftRadius: size * 0.44,
                borderTopRightRadius: size * 0.44,
                borderBottomWidth: 0,
              },
            ]}
          />
          {/* Stick */}
          <View
            style={[
              styles.umbrellaStick,
              {
                backgroundColor: color,
                width: strokeWidth,
                height: size * 0.42,
              },
            ]}
          />
          {/* Handle hook */}
          <View
            style={[
              styles.umbrellaHook,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                borderTopWidth: 0,
                width: size * 0.22,
                height: size * 0.16,
                borderBottomLeftRadius: size * 0.12,
                borderBottomRightRadius: size * 0.12,
                left: -size * 0.08,
              },
            ]}
          />
        </View>
      );

    case "first-aid":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* First aid box */}
          <View
            style={[
              styles.firstAidBox,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.72,
                borderRadius: 4,
              },
            ]}
          >
            {/* Cross vertical */}
            <View
              style={[
                styles.crossV,
                {
                  backgroundColor: color,
                  width: strokeWidth * 1.5,
                  height: size * 0.36,
                },
              ]}
            />
            {/* Cross horizontal */}
            <View
              style={[
                styles.crossH,
                {
                  backgroundColor: color,
                  width: size * 0.36,
                  height: strokeWidth * 1.5,
                },
              ]}
            />
          </View>
        </View>
      );

    case "phone":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Phone handset */}
          <View
            style={[
              styles.phoneHandset,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.52,
                height: size * 0.82,
                borderRadius: 5,
              },
            ]}
          >
            <View style={[styles.earpiece, {backgroundColor: color, width: size * 0.2, height: strokeWidth}]} />
            <View style={[styles.homeBtn, {borderColor: color, borderWidth: strokeWidth * 0.8, width: strokeWidth * 2, height: strokeWidth * 2, borderRadius: strokeWidth}]} />
          </View>
        </View>
      );

    case "email":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.envelope,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.88,
                height: size * 0.65,
                borderRadius: 3,
              },
            ]}
          >
            <View
              style={[
                styles.envelopeFlap,
                {
                  borderTopColor: color,
                  borderLeftColor: "transparent",
                  borderRightColor: "transparent",
                  borderTopWidth: size * 0.24,
                  borderLeftWidth: size * 0.4,
                  borderRightWidth: size * 0.4,
                },
              ]}
            />
          </View>
        </View>
      );

    case "whatsapp":
    case "chat":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.chatBubble,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.85,
                height: size * 0.72,
                borderRadius: size * 0.36,
              },
            ]}
          >
            <View
              style={[
                styles.bubbleTail,
                {
                  borderTopColor: color,
                  borderLeftColor: "transparent",
                  borderTopWidth: size * 0.2,
                  borderLeftWidth: size * 0.2,
                  bottom: -size * 0.14,
                  left: size * 0.15,
                },
              ]}
            />
          </View>
        </View>
      );

    case "search":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.6,
                height: size * 0.6,
                borderRadius: (size * 0.6) / 2,
                top: -size * 0.06,
                left: -size * 0.06,
              },
            ]}
          />
          <View
            style={[
              styles.searchHandle,
              {
                backgroundColor: color,
                width: size * 0.35,
                height: strokeWidth * 1.2,
                transform: [{rotate: "45deg"}],
                bottom: size * 0.12,
                right: size * 0.12,
                borderRadius: 1,
              },
            ]}
          />
        </View>
      );

    case "trash":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Lid handle */}
          <View style={[styles.trashLidHandle, {backgroundColor: color, width: size * 0.25, height: strokeWidth, borderTopLeftRadius: 1, borderTopRightRadius: 1}]} />
          {/* Lid bar */}
          <View style={[styles.trashLid, {backgroundColor: color, width: size * 0.78, height: strokeWidth, borderRadius: 1}]} />
          {/* Can body */}
          <View
            style={[
              styles.trashCan,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.62,
                height: size * 0.62,
                borderBottomLeftRadius: 3,
                borderBottomRightRadius: 3,
                borderTopWidth: 0,
              },
            ]}
          >
            {/* Rib lines */}
            <View style={[styles.trashRib, {backgroundColor: color, width: strokeWidth * 0.9, height: "70%"}]} />
            <View style={[styles.trashRib, {backgroundColor: color, width: strokeWidth * 0.9, height: "70%"}]} />
          </View>
        </View>
      );

    case "user":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Head */}
          <View
            style={[
              styles.circleOutline,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.38,
                height: size * 0.38,
                borderRadius: (size * 0.38) / 2,
                marginBottom: 2,
              },
            ]}
          />
          {/* Shoulders */}
          <View
            style={[
              styles.userShoulders,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.8,
                height: size * 0.38,
                borderTopLeftRadius: size * 0.4,
                borderTopRightRadius: size * 0.4,
                borderBottomWidth: 0,
              },
            ]}
          />
        </View>
      );

    case "chevron-right":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <Text
            style={[
              styles.chevronText,
              {
                color: color,
                fontSize: size * 0.9,
                lineHeight: size * 0.92,
              },
            ]}
          >
            ›
          </Text>
        </View>
      );

    case "check":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <Text
            style={[
              styles.checkText,
              {
                color: color,
                fontSize: size * 0.8,
                lineHeight: size * 0.85,
                fontWeight: "700",
              },
            ]}
          >
            ✓
          </Text>
        </View>
      );

    case "download":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Arrow down shaft */}
          <View style={[styles.downShaft, {backgroundColor: color, width: strokeWidth, height: size * 0.5, top: 1}]} />
          {/* Arrow down head */}
          <Text style={[styles.downHead, {color: color, fontSize: size * 0.5, lineHeight: size * 0.5, top: size * 0.28}]}>
            ⌄
          </Text>
          {/* Tray base */}
          <View
            style={[
              styles.trayBase,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                borderTopWidth: 0,
                width: size * 0.78,
                height: size * 0.25,
                borderRadius: 2,
                bottom: 1,
              },
            ]}
          />
        </View>
      );

    case "location":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          <View
            style={[
              styles.pinHead,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.65,
                height: size * 0.65,
                borderRadius: (size * 0.65) / 2,
              },
            ]}
          >
            <View style={[styles.pinDot, {backgroundColor: color, width: strokeWidth * 1.5, height: strokeWidth * 1.5, borderRadius: strokeWidth}]} />
          </View>
          <View
            style={[
              styles.pinPoint,
              {
                borderTopColor: color,
                borderLeftColor: "transparent",
                borderRightColor: "transparent",
                borderTopWidth: size * 0.25,
                borderLeftWidth: size * 0.18,
                borderRightWidth: size * 0.18,
                marginTop: -1,
              },
            ]}
          />
        </View>
      );

    case "camera":
      return (
        <View style={[styles.center, {width: size, height: size}, style]}>
          {/* Top flash bump */}
          <View style={[styles.cameraBump, {backgroundColor: color, width: size * 0.25, height: strokeWidth * 1.2, borderTopLeftRadius: 2, borderTopRightRadius: 2}]} />
          {/* Body */}
          <View
            style={[
              styles.cameraBody,
              {
                borderColor: color,
                borderWidth: strokeWidth,
                width: size * 0.85,
                height: size * 0.62,
                borderRadius: 4,
              },
            ]}
          >
            {/* Lens */}
            <View
              style={[
                styles.circleOutline,
                {
                  borderColor: color,
                  borderWidth: strokeWidth,
                  width: size * 0.3,
                  height: size * 0.3,
                  borderRadius: (size * 0.3) / 2,
                },
              ]}
            />
          </View>
        </View>
      );

    default:
      return null;
  }
});

const styles = StyleSheet.create({
  center: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  blade: {
    position: "absolute",
    borderRadius: 1,
  },
  fingerLoop: {
    position: "absolute",
  },
  circleOutline: {
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
  },
  handHour: {
    position: "absolute",
    borderRadius: 1,
  },
  handMinute: {
    position: "absolute",
    borderRadius: 1,
  },
  openBook: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  bookSpine: {
    marginHorizontal: 1,
  },
  bookLinesContainer: {
    position: "absolute",
    left: 4,
  },
  bookLine: {
    borderRadius: 1,
  },
  speedometerArc: {
    alignItems: "center",
    justifyContent: "flex-end",
    position: "relative",
  },
  needle: {
    position: "absolute",
    borderRadius: 1,
    transformOrigin: "bottom center",
  },
  pivotDot: {
    position: "absolute",
  },
  certSheet: {
    alignItems: "center",
    justifyContent: "center",
  },
  certSeal: {
    position: "absolute",
    top: 3,
  },
  certLine: {
    borderRadius: 1,
  },
  shieldBody: {
    alignItems: "center",
    justifyContent: "center",
  },
  shieldKeyhole: {
    marginBottom: 2,
  },
  pediment: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
  },
  bankBeam: {
    borderRadius: 1,
  },
  pillarsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  pillar: {
    height: "100%",
    borderRadius: 1,
  },
  bankBase: {
    marginTop: 1,
  },
  faqQMark: {
    fontWeight: "800",
    textAlign: "center",
  },
  bellBody: {
    alignSelf: "center",
  },
  bellRim: {
    alignSelf: "center",
  },
  bellClapper: {
    alignSelf: "center",
  },
  headband: {
    alignSelf: "center",
  },
  earpad: {
    position: "absolute",
  },
  micBoom: {
    position: "absolute",
  },
  globeEquator: {
    position: "absolute",
  },
  globeMeridian: {
    position: "absolute",
  },
  crescentMoon: {
    transform: [{rotate: "-35deg"}],
  },
  infoDot: {
    alignSelf: "center",
  },
  infoBar: {
    alignSelf: "center",
  },
  doorway: {
    position: "absolute",
  },
  arrowContainer: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
  },
  arrowShaft: {
    borderRadius: 1,
  },
  arrowHeadText: {
    fontWeight: "700",
  },
  calendarBinderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 2,
  },
  clip: {
    borderRadius: 1,
  },
  calendarBox: {
    alignItems: "center",
    overflow: "hidden",
  },
  calendarBar: {
    marginBottom: 3,
  },
  calendarDotsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%",
    marginTop: 2,
  },
  calDot: {
    borderRadius: 1,
  },
  walletBody: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  walletClasp: {
    position: "absolute",
  },
  umbrellaDome: {
    alignSelf: "center",
  },
  umbrellaStick: {
    alignSelf: "center",
    marginTop: -1,
  },
  umbrellaHook: {
    position: "absolute",
    bottom: 0,
  },
  firstAidBox: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  crossV: {
    position: "absolute",
    borderRadius: 1,
  },
  crossH: {
    position: "absolute",
    borderRadius: 1,
  },
  phoneHandset: {
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  earpiece: {
    borderRadius: 1,
  },
  homeBtn: {
    marginBottom: 1,
  },
  envelope: {
    alignItems: "center",
    overflow: "hidden",
  },
  envelopeFlap: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
  chatBubble: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bubbleTail: {
    position: "absolute",
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
  searchHandle: {
    position: "absolute",
  },
  trashLidHandle: {
    alignSelf: "center",
    marginBottom: 1,
  },
  trashLid: {
    alignSelf: "center",
    marginBottom: 1,
  },
  trashCan: {
    alignSelf: "center",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  trashRib: {
    borderRadius: 1,
  },
  userShoulders: {
    alignSelf: "center",
  },
  chevronText: {
    fontWeight: "400",
  },
  checkText: {
    textAlign: "center",
  },
  downShaft: {
    position: "absolute",
  },
  downHead: {
    position: "absolute",
    fontWeight: "900",
  },
  trayBase: {
    position: "absolute",
  },
  pinHead: {
    alignItems: "center",
    justifyContent: "center",
  },
  pinDot: {},
  pinPoint: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
  },
  cameraBump: {
    alignSelf: "center",
    marginBottom: 1,
  },
  cameraBody: {
    alignItems: "center",
    justifyContent: "center",
  },
});
