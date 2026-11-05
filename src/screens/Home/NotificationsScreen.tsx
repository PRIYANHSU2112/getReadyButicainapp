import React, {useCallback, useMemo, useState} from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  RefreshControl,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {RootStackParamList} from "../../navigation/types";
import {AppNotification} from "../../types";
import {useNotifications} from "../../hooks/queries";
import {notificationService} from "../../services/partnerService";
import {AppIcon, EmptyState} from "../../components/common";
import {palette} from "../../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Notifications">;

export const NotificationsScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {data, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage} = useNotifications();
  const [menuVisible, setMenuVisible] = useState(false);
  // Optimistic overlays so taps feel instant; server calls fire in the background.
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());

  const notifications = useMemo<AppNotification[]>(
    () =>
      (data ?? [])
        .filter(n => !hiddenIds.has(n.id))
        .map(n => (readIds.has(n.id) ? {...n, isUnread: false} : n)),
    [data, readIds, hiddenIds],
  );

  const todayNotifications = useMemo(() => notifications.filter(n => n.category === "today"), [notifications]);
  const earlierNotifications = useMemo(() => notifications.filter(n => n.category === "earlier"), [notifications]);

  const markRead = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setReadIds(prev => new Set([...prev, ...ids]));
    ids.forEach(id => notificationService.markRead(id).catch(() => undefined));
  }, []);

  const handleToggleRead = (id: string) => {
    if (notifications.find(n => n.id === id)?.isUnread) markRead([id]);
  };

  const handleMarkAllRead = () => {
    markRead(notifications.filter(n => n.isUnread).map(n => n.id));
    setMenuVisible(false);
  };

  const clearAll = () => {
    const ids = notifications.map(n => n.id);
    setHiddenIds(prev => new Set([...prev, ...ids]));
    ids.forEach(id => notificationService.remove(id).catch(() => undefined));
  };

  const onScroll = ({nativeEvent: e}: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (hasNextPage && !isFetchingNextPage && e.layoutMeasurement.height + e.contentOffset.y >= e.contentSize.height - 200) {
      fetchNextPage();
    }
  };

  const handleClearList = () => {
    setMenuVisible(false);
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to clear your notification history?",
      [
        {text: "Cancel", style: "cancel"},
        {
          text: "Clear List",
          style: "destructive",
          onPress: clearAll,
        },
      ]
    );
  };

  const renderNotificationCard = (item: AppNotification) => {
    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.7}
        onPress={() => handleToggleRead(item.id)}
        accessibilityRole="button"
        accessibilityLabel={`${item.title}: ${item.message}`}
        style={styles.notificationItemRow}>
        {/* Star Icon Container with Blue Unread Dot matching Images 2 & 3 */}
        <View style={styles.iconContainerWrapper}>
          <View style={styles.iconBox}>
            <Text style={styles.starGlyph}>★</Text>
          </View>
          {item.isUnread && <View style={styles.unreadBlueDot} />}
        </View>

        {/* Text Content */}
        <View style={styles.contentColumn}>
          <View style={styles.titleTimeRow}>
            <Text
              style={[
                styles.itemTitleText,
                item.isUnread && styles.itemTitleTextBold,
              ]}>
              {item.title}
            </Text>
            <Text style={styles.timeAgoText}>{item.time}</Text>
          </View>
          <Text style={styles.itemMessageText} numberOfLines={3}>
            {item.message}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
      <View style={styles.screenContainer}>
        {/* Top Header matching Images 2 & 3: < Notifications ... */}
        <View style={[styles.headerContainer, {paddingTop: Math.max(insets.top, 14)}]}>
          <View style={styles.headerLeftGroup}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={styles.backCircleBtn}>
              <Text style={styles.backChevron}>‹</Text>
            </TouchableOpacity>
            <Text maxFontSizeMultiplier={1.3} style={styles.headerTitle}>
              Notifications
            </Text>
          </View>

          {/* Three-dots menu button */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setMenuVisible(!menuVisible)}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            accessibilityRole="button"
            accessibilityLabel="Options menu"
            style={styles.threeDotsBtn}>
            <Text style={styles.threeDotsSymbol}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Popup Options Menu matching Image 2 */}
        {menuVisible && (
          <View style={styles.popupMenuCard}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleMarkAllRead}
              style={styles.popupMenuItem}>
              <Text style={styles.popupMenuItemText}>Mark as all read</Text>
            </TouchableOpacity>
            <View style={styles.popupDivider} />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleClearList}
              style={styles.popupMenuItem}>
              <Text style={styles.popupMenuClearText}>Clear List</Text>
            </TouchableOpacity>
          </View>
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={onScroll}
          scrollEventThrottle={250}
          refreshControl={<RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={() => { setHiddenIds(new Set()); refetch(); }} colors={["#114B3E"]} />}
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: Math.max(insets.bottom + 24, 36)},
          ]}>
          {isLoading ? (
            <ActivityIndicator style={{marginTop: 40}} color="#114B3E" />
          ) : notifications.length === 0 ? (
            <EmptyState
              icon={<AppIcon name="emergency" size={38} color={palette.brand.crimson} />}
              title="Quiet for now"
              subtitle="Your booking alerts and updates will appear here."
              actionLabel="Go To Dashboard"
              onAction={() => navigation.navigate("MainTabs", {screen: "DashboardTab"})}
            />
          ) : (
            <>
              {/* Today Section */}
              {todayNotifications.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeading}>Today</Text>
                  <View style={styles.notificationsListCard}>
                    {todayNotifications.map(renderNotificationCard)}
                  </View>
                </View>
              )}

              {/* Earlier Section */}
              {earlierNotifications.length > 0 && (
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionHeading}>Earlier</Text>
                  <View style={styles.notificationsListCard}>
                    {earlierNotifications.map(renderNotificationCard)}
                  </View>
                </View>
              )}
              {isFetchingNextPage && <ActivityIndicator style={{marginVertical: 16}} color="#114B3E" />}
            </>
          )}
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  headerLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  backCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FAEDF1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backChevron: {
    fontSize: 22,
    lineHeight: 22,
    color: "#B02B58",
    fontWeight: "700",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.3,
  },
  threeDotsBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF5F5",
    alignItems: "center",
    justifyContent: "center",
  },
  threeDotsSymbol: {
    fontSize: 20,
    lineHeight: 20,
    color: "#EF4444",
    fontWeight: "800",
  },
  popupMenuCard: {
    position: "absolute",
    top: 62,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 150,
    shadowColor: "#000000",
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    zIndex: 99,
  },
  popupMenuItem: {
    paddingVertical: 10,
  },
  popupMenuItemText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#1F2937",
  },
  popupDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
  },
  popupMenuClearText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#EF4444",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B5563",
    marginBottom: 12,
  },
  notificationsListCard: {
    backgroundColor: "#FFFFFF",
  },
  notificationItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  iconContainerWrapper: {
    position: "relative",
    marginRight: 14,
    marginTop: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  starGlyph: {
    fontSize: 18,
    color: "#114B3E",
  },
  unreadBlueDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: "#2563EB", // Blue unread dot matching Images 2 & 3
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  contentColumn: {
    flex: 1,
  },
  titleTimeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  itemTitleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  itemTitleTextBold: {
    fontWeight: "700",
  },
  timeAgoText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  itemMessageText: {
    fontSize: 12.5,
    color: "#6B7280",
    lineHeight: 18,
  },
});
