import React from "react";
import {StyleSheet, View, Text, TouchableOpacity} from "react-native";
import {createBottomTabNavigator, BottomTabBarProps} from "@react-navigation/bottom-tabs";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {MainTabParamList} from "./types";
import {DashboardScreen} from "../screens/Home/DashboardScreen";
import {BookingsListScreen} from "../screens/Bookings/BookingsListScreen";
import {EarningsDashboardScreen} from "../screens/Wallet/EarningsDashboardScreen";
import {ProfileScreen} from "../screens/Profile/ProfileScreen";
import {TabIcon, TabIconName} from "../components/common";

const Tab = createBottomTabNavigator<MainTabParamList>();

const CustomTabBar: React.FC<BottomTabBarProps> = ({state, navigation}) => {
  const insets = useSafeAreaInsets();

  const handleCenterAction = () => {
    const rootNav = navigation.getParent() || navigation;
    (rootNav as any).navigate("AddService");
  };

  const getTabMeta = (routeName: string): {label: string; iconName: TabIconName} => {
    switch (routeName) {
      case "DashboardTab":
        return {label: "Home", iconName: "home"};
      case "BookingsTab":
        return {label: "Bookings", iconName: "bookings"};
      case "WalletTab":
        return {label: "Wallet", iconName: "wallet"};
      case "ProfileTab":
        return {label: "Profile", iconName: "profile"};
      default:
        return {label: routeName, iconName: "home"};
    }
  };

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2, 4);

  // Dynamic safe area calculation:
  // If phone has a system navigation bar (insets.bottom > 0, e.g. 48dp on Samsung 3-button nav),
  // we add insets.bottom to the container height so the entire tab bar sits ABOVE the Android nav bar.
  // If phone has no bottom bar (insets.bottom === 0), it opens in full screen with standard 8dp padding.
  const hasBottomInset = insets.bottom > 0;
  const bottomPadding = hasBottomInset ? insets.bottom : 8;
  const dynamicBarHeight = 62 + (hasBottomInset ? insets.bottom : 0);

  return (
    <View
      style={[
        styles.tabBarWrapper,
        {
          height: dynamicBarHeight,
          paddingBottom: bottomPadding,
        },
      ]}>
      {/* Left 2 Tabs: Home & Bookings */}
      {leftRoutes.map((route, index) => {
        const isFocused = state.index === index;
        const meta = getTabMeta(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{selected: isFocused}}
            style={styles.tabButton}>
            <TabIcon name={meta.iconName} isFocused={isFocused} size={22} />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Floating Center Action Button matching Images */}
      <View style={styles.centerButtonWrapper}>
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleCenterAction}
          accessibilityRole="button"
          accessibilityLabel="Add Service / Quick Action"
          style={styles.centerFabButton}>
          <Text style={styles.centerFabPlus}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Right 2 Tabs: Wallet & Profile */}
      {rightRoutes.map((route, i) => {
        const index = i + 2;
        const isFocused = state.index === index;
        const meta = getTabMeta(route.name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            activeOpacity={0.7}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{selected: isFocused}}
            style={styles.tabButton}>
            <TabIcon name={meta.iconName} isFocused={isFocused} size={22} />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {meta.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="DashboardTab" component={DashboardScreen} />
      <Tab.Screen name="BookingsTab" component={BookingsListScreen} />
      <Tab.Screen name="WalletTab" component={EarningsDashboardScreen} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 8,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 19,
    color: "#6B7280",
    marginBottom: 3,
  },
  tabIconActive: {
    color: "#114B3E",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
    marginTop: 4,
  },
  tabLabelActive: {
    color: "#114B3E",
    fontWeight: "700",
  },
  centerButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -20,
    paddingHorizontal: 6,
  },
  centerFabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#114B3E", // Deep emerald matching screenshots
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#114B3E",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
  },
  centerFabPlus: {
    fontSize: 28,
    lineHeight: 30,
    color: "#FFFFFF",
    fontWeight: "400",
    marginTop: -2,
  },
});
