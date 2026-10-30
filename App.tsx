import React from "react";
import {StatusBar} from "react-native";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {QueryClientProvider} from "@tanstack/react-query";
import {ThemeProvider} from "./src/theme";
import {queryClient} from "./src/services/queryClient";
import {AuthProvider} from "./src/context/AuthContext";
import {PartnerProvider} from "./src/context/PartnerContext";
import {BookingProvider} from "./src/context/BookingContext";
import {LocationProvider} from "./src/context/LocationContext";
import {RootNavigator} from "./src/navigation/RootNavigator";
import {ToastHost} from "./src/components/common/Toast";
import {LiveSync} from "./src/components/common/LiveSync";

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <PartnerProvider>
              <BookingProvider>
                <LocationProvider>
                  <StatusBar barStyle="dark-content" {...({backgroundColor: "transparent", translucent: true} as any)} />
                  <RootNavigator />
                  <LiveSync />
                  <ToastHost />
                </LocationProvider>
              </BookingProvider>
            </PartnerProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
