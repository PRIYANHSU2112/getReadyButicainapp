import React, {useState, useMemo, useCallback, memo} from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {BottomTabScreenProps} from "@react-navigation/bottom-tabs";
import {MainTabParamList} from "../../navigation/types";
import {BookingCard, BookingCardData} from "../../components/common";
import {useAssignmentCards} from "../../hooks/queries";

type Props = BottomTabScreenProps<MainTabParamList, "BookingsTab">;

type FilterTab = "All" | "Upcoming" | "Completed" | "Cancelled";
type SortOption = "Earliest Slot" | "Customer" | "Date";

interface RowProps {
  item: BookingCardData;
  onDetails: (b: BookingCardData) => void;
  onStart: (id: string) => void;
  onInvoice: (id: string) => void;
}

const BookingRow = memo(({item, onDetails, onStart, onInvoice}: RowProps) => {
  const isUpcoming = item.status === "assigned" || item.status === "upcoming";
  return (
    <BookingCard
      booking={item}
      onPressCard={() => onDetails(item)}
      onPrimaryPress={() => (isUpcoming ? onStart(item.id) : onDetails(item))}
      onSecondaryPress={() => (item.status === "completed" ? onInvoice(item.id) : onDetails(item))}
    />
  );
});

export const BookingsListScreen: React.FC<Props> = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<FilterTab>("Upcoming");
  const [sortOption, setSortOption] = useState<SortOption>("Earliest Slot");
  const {cards, isLoading, isRefetching, refetch, fetchNextPage, hasNextPage, isFetchingNextPage} = useAssignmentCards();

  const filterTabs: FilterTab[] = ["All", "Upcoming", "Completed", "Cancelled"];

  const handleCycleSort = () => {
    if (sortOption === "Earliest Slot") setSortOption("Customer");
    else if (sortOption === "Customer") setSortOption("Date");
    else setSortOption("Earliest Slot");
  };

  const filteredBookings = useMemo(() => {
    let list = [...cards];
    if (activeTab === "Upcoming") {
      list = list.filter(b => b.status === "assigned" || b.status === "upcoming");
    } else if (activeTab === "Completed") {
      list = list.filter(b => b.status === "completed");
    } else if (activeTab === "Cancelled") {
      list = list.filter(b => b.status === "canceled" || b.status === "cancelled");
    }

    if (sortOption === "Customer") {
      list.sort((a, b) => a.customerName.localeCompare(b.customerName));
    } else if (sortOption === "Date") {
      list.sort((a, b) => Date.parse(`${b.date} ${b.time}`) - Date.parse(`${a.date} ${a.time}`));
    }
    return list;
  }, [cards, activeTab, sortOption]);

  const handleStartJourney = useCallback((bookingId: string) => {
    const rootNav = navigation.getParent() || navigation;
    (rootNav as any).navigate("EnRoute", {bookingId});
  }, [navigation]);

  const handleViewDetails = useCallback((booking: BookingCardData) => {
    const rootNav = navigation.getParent() || navigation;
    if (booking.status === "completed") {
      (rootNav as any).navigate("CompletedBookingDetail", {bookingId: booking.id});
    } else if (booking.status === "canceled" || booking.status === "cancelled") {
      (rootNav as any).navigate("CancellationDetails", {
        bookingId: booking.id,
        cancelledBy: "customer",
        clientName: booking.customerName,
      });
    } else {
      (rootNav as any).navigate("JobDetail", {bookingId: booking.id});
    }
  }, [navigation]);

  const handleViewInvoice = useCallback((bookingId: string) => {
    const rootNav = navigation.getParent() || navigation;
    (rootNav as any).navigate("BookingReceipt", {bookingId});
  }, [navigation]);

  const renderItem = useCallback(
    ({item}: {item: BookingCardData}) => (
      <BookingRow item={item} onDetails={handleViewDetails} onStart={handleStartJourney} onInvoice={handleViewInvoice} />
    ),
    [handleViewDetails, handleStartJourney, handleViewInvoice],
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <StatusBar barStyle="dark-content" />

      {/* Header matching Figma: < Bookings */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
        >
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bookings</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter Tabs Row matching Figma */}
      <View style={styles.filterTabsRow}>
        {filterTabs.map(tab => {
          const isSelected = activeTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tabPill,
                isSelected ? styles.tabPillActive : styles.tabPillInactive,
              ]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabPillText,
                  isSelected ? styles.tabPillTextActive : styles.tabPillTextInactive,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sort Option Pill matching Figma */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortPill}
          onPress={handleCycleSort}
          activeOpacity={0.75}
        >
          <Text style={styles.sortIcon}>⚑</Text>
          <Text style={styles.sortText}>Sort by: </Text>
          <Text style={styles.sortValueText}>{sortOption}</Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        refreshControl={<RefreshControl refreshing={isRefetching && !isFetchingNextPage} onRefresh={() => { refetch(); }} colors={["#114B3E"]} />}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: Math.max(insets.bottom, 16) + 70},
        ]}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{marginVertical: 16}} color="#114B3E" /> : undefined}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{marginTop: 40}} color="#114B3E" />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>No {activeTab} Bookings</Text>
              <Text style={styles.emptySubtitle}>
                New appointments will appear here automatically.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  backChevron: {
    fontSize: 26,
    fontWeight: "300",
    color: "#0F172A",
    marginTop: -2,
  },
  headerTitle: {
    fontSize: 17.5,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSpacer: {
    width: 38,
  },
  filterTabsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  tabPill: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabPillActive: {
    backgroundColor: "#E6F7F0",
    borderColor: "#D1F0E0",
  },
  tabPillInactive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  tabPillText: {
    fontSize: 12.5,
    fontWeight: "600",
  },
  tabPillTextActive: {
    color: "#114B3E",
    fontWeight: "700",
  },
  tabPillTextInactive: {
    color: "#64748B",
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: "flex-start",
  },
  sortPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sortIcon: {
    fontSize: 12,
    color: "#475569",
    marginRight: 6,
  },
  sortText: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "500",
  },
  sortValueText: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
});
