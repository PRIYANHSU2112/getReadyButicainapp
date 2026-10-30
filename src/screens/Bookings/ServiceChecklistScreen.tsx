import React from "react";
import {StyleSheet, Text, View, ActivityIndicator, Alert} from "react-native";
import {useTheme} from "../../theme";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {ScreenContainer, Header, Button, Card} from "../../components/common";
import {useBookingDetail, useCompleteItem} from "../../hooks/queries";

type Props = NativeStackScreenProps<RootStackParamList, "ServiceChecklist">;

export const ServiceChecklistScreen: React.FC<Props> = ({route, navigation}) => {
  const {bookingId} = route.params;
  const {theme} = useTheme();
  const {data: booking, isLoading} = useBookingDetail(bookingId);
  const completeItem = useCompleteItem();

  const items = booking?.items ?? [];
  const allDone = items.length > 0 && items.every(i => i.completed);

  // Completion is one-way on the backend, so confirm before marking.
  const markDone = (itemId: string, title: string) => {
    if (completeItem.isPending) return;
    Alert.alert("Mark as Completed", `Confirm "${title}" is finished?`, [
      {text: "Not yet", style: "cancel"},
      {text: "Completed", onPress: () => completeItem.mutate({id: bookingId, itemId})},
    ]);
  };

  return (
    <ScreenContainer scrollable>
      <Header title="Service Checklist" />
      <View style={styles.content}>
        <Text style={[theme.typography.h2, {color: theme.colors.textPrimary}]}>
          {allDone ? "All Services Done" : "In Progress"}
        </Text>
        <Text style={[theme.typography.body2, styles.subtitle, {color: theme.colors.textSecondary}]}>
          Mark each service as you finish it
        </Text>

        {isLoading && <ActivityIndicator color={theme.colors.primary} />}

        {items.map(item => {
          const isDone = item.completed;
          return (
            <Card key={item.serviceId} onPress={isDone ? undefined : () => markDone(item.serviceId, item.serviceTitle)}>
              <View style={styles.checkRow}>
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isDone ? theme.colors.primary : "transparent",
                      borderColor: isDone ? theme.colors.primary : theme.colors.border,
                    },
                  ]}>
                  {isDone ? <Text style={styles.checkIcon}>✓</Text> : null}
                </View>
                <Text
                  style={[
                    theme.typography.body1,
                    styles.itemText,
                    {
                      color: isDone ? theme.colors.textSecondary : theme.colors.textPrimary,
                      textDecorationLine: isDone ? "line-through" : "none",
                    },
                  ]}>
                  {item.serviceTitle} • {item.duration} min
                </Text>
              </View>
            </Card>
          );
        })}

        <Button
          title="Complete Service & Request End OTP"
          onPress={() => navigation.navigate("EndOtp", {bookingId})}
          disabled={!allDone}
          size="large"
          style={styles.btn}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  content: {padding: 16},
  subtitle: {marginTop: 4, marginBottom: 16},
  checkRow: {flexDirection: "row", alignItems: "center"},
  checkbox: {width: 24, height: 24, borderRadius: 6, borderWidth: 2, alignItems: "center", justifyContent: "center"},
  checkIcon: {color: "#FFF", fontSize: 14, fontWeight: "700"},
  itemText: {marginLeft: 12, flex: 1},
  btn: {marginTop: 24, marginBottom: 32},
});
