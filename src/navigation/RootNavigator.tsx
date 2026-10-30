import React from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {RootStackParamList} from "./types";
import {useAuth} from "../context/AuthContext";

// Auth screens
import {SplashScreen} from "../screens/Auth/SplashScreen";
import {OnboardingScreen} from "../screens/Auth/OnboardingScreen";
import {LoginScreen} from "../screens/Auth/LoginScreen";
import {OTPScreen} from "../screens/Auth/OTPScreen";

// KYC screens
import {KycNavigator} from "./KycNavigator";
import {KycPendingScreen} from "../screens/Kyc/KycPendingScreen";

// Main tabs
import {TabNavigator} from "./TabNavigator";

// Booking flow
import {IncomingJobScreen} from "../screens/Bookings/IncomingJobScreen";
import {JobDetailScreen} from "../screens/Bookings/JobDetailScreen";
import {EnRouteScreen} from "../screens/Bookings/EnRouteScreen";
import {StartOtpScreen} from "../screens/Bookings/StartOtpScreen";
import {ServiceCheckInScreen} from "../screens/Bookings/ServiceCheckInScreen";
import {ServiceChecklistScreen} from "../screens/Bookings/ServiceChecklistScreen";
import {AddExtraServiceScreen} from "../screens/Bookings/AddExtraServiceScreen";
import {AwaitingApprovalScreen} from "../screens/Bookings/AwaitingApprovalScreen";
import {ServiceAddedSuccessScreen} from "../screens/Bookings/ServiceAddedSuccessScreen";
import {ServiceCheckOutScreen} from "../screens/Bookings/ServiceCheckOutScreen";
import {EndOtpScreen} from "../screens/Bookings/EndOtpScreen";
import {ItemsDetailsScreen} from "../screens/Bookings/ItemsDetailsScreen";
import {JobCompletedScreen} from "../screens/Bookings/JobCompletedScreen";
import {CompletedBookingDetailScreen} from "../screens/Bookings/CompletedBookingDetailScreen";
import {PreviousBookingsScreen} from "../screens/Bookings/PreviousBookingsScreen";
import {CancelBookingScreen} from "../screens/Bookings/CancelBookingScreen";
import {BookingReceiptScreen} from "../screens/Bookings/BookingReceiptScreen";

// Other screens
import {AddServiceScreen} from "../screens/Services/AddServiceScreen";
import {MyServicesScreen} from "../screens/Services/MyServicesScreen";
import {ManageServiceScreen} from "../screens/Services/ManageServiceScreen";
import {PackageDetailsScreen} from "../screens/Services/PackageDetailsScreen";
import {EditPackageScreen} from "../screens/Services/EditPackageScreen";
import {SlotManagerScreen} from "../screens/Calendar/SlotManagerScreen";
import {
  PayoutRequestScreen,
  EarningsHistoryScreen,
  TransactionDetailsScreen,
  WithdrawalSuccessScreen,
} from "../screens/Wallet";
import {
  EditProfileScreen,
  PrimaryAddressScreen,
  MyPerformanceScreen,
  AttendanceScreen,
  SalaryBreakdownScreen,
  MyLeavesScreen,
  SubmitLeaveScreen,
  DocumentsCertificatesScreen,
  AddCertificateScreen,
  AddWorkExperienceScreen,
  BankDetailsScreen,
  EditBankDetailsScreen,
  EmergencyContactsScreen,
  AddEmergencyContactScreen,
  FaqScreen,
  HelpSupportScreen,
  PrivacyPolicyScreen,
  VerificationCenterScreen,
} from "../screens/Profile";
import {NotificationsScreen} from "../screens/Home/NotificationsScreen";
import {CancellationDetailsScreen} from "../screens/Bookings/CancellationDetailsScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const {isAuthenticated, partner} = useAuth();
  const kycApproved = partner?.kycStatus === "approved";

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="Splash">
        {/* Always accessible */}
        <Stack.Screen name="Splash" component={SplashScreen} />

        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="OTPVerification" component={OTPScreen} />
          </>
        ) : !kycApproved ? (
          <>
            <Stack.Screen name="KycStack" component={KycNavigator} />
            <Stack.Screen name="KycPending" component={KycPendingScreen} />
            <Stack.Screen name="VerificationCenter" component={VerificationCenterScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="VerificationCenter" component={VerificationCenterScreen} />
            <Stack.Screen name="IncomingJob" component={IncomingJobScreen} options={{presentation: "modal"}} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="EnRoute" component={EnRouteScreen} />
            <Stack.Screen name="StartOtp" component={StartOtpScreen} />
            <Stack.Screen name="ServiceCheckIn" component={ServiceCheckInScreen} />
            <Stack.Screen name="AddExtraService" component={AddExtraServiceScreen} />
            <Stack.Screen name="AwaitingApproval" component={AwaitingApprovalScreen} />
            <Stack.Screen name="ServiceAddedSuccess" component={ServiceAddedSuccessScreen} />
            <Stack.Screen name="ServiceCheckOut" component={ServiceCheckOutScreen} />
            <Stack.Screen name="EndOtp" component={EndOtpScreen} />
            <Stack.Screen name="ItemsDetails" component={ItemsDetailsScreen} />
            <Stack.Screen name="ServiceChecklist" component={ServiceChecklistScreen} />
            <Stack.Screen name="JobCompleted" component={JobCompletedScreen} />
            <Stack.Screen name="MyServices" component={MyServicesScreen} />
            <Stack.Screen name="ManageService" component={ManageServiceScreen} />
            <Stack.Screen name="PackageDetails" component={PackageDetailsScreen} />
            <Stack.Screen name="EditPackage" component={EditPackageScreen} />
            <Stack.Screen name="AddService" component={AddServiceScreen} />
            <Stack.Screen name="SlotManager" component={SlotManagerScreen} />
            <Stack.Screen name="PayoutRequest" component={PayoutRequestScreen} />
            <Stack.Screen name="EarningsHistory" component={EarningsHistoryScreen} />
            <Stack.Screen name="TransactionDetails" component={TransactionDetailsScreen} />
            <Stack.Screen name="WithdrawalSuccess" component={WithdrawalSuccessScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="PrimaryAddress" component={PrimaryAddressScreen} />
            <Stack.Screen name="MyPerformance" component={MyPerformanceScreen} />
            <Stack.Screen name="Attendance" component={AttendanceScreen} />
            <Stack.Screen name="SalaryBreakdown" component={SalaryBreakdownScreen} />
            <Stack.Screen name="MyLeaves" component={MyLeavesScreen} />
            <Stack.Screen name="SubmitLeave" component={SubmitLeaveScreen} />
            <Stack.Screen name="DocumentsCertificates" component={DocumentsCertificatesScreen} />
            <Stack.Screen name="AddCertificate" component={AddCertificateScreen} />
            <Stack.Screen name="AddWorkExperience" component={AddWorkExperienceScreen} />
            <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
            <Stack.Screen name="EditBankDetails" component={EditBankDetailsScreen} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
            <Stack.Screen name="AddEmergencyContact" component={AddEmergencyContactScreen} />
            <Stack.Screen name="Faq" component={FaqScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="CompletedBookingDetail" component={CompletedBookingDetailScreen} />
            <Stack.Screen name="PreviousBookings" component={PreviousBookingsScreen} />
            <Stack.Screen name="CancelBooking" component={CancelBookingScreen} />
            <Stack.Screen name="BookingReceipt" component={BookingReceiptScreen} />
            <Stack.Screen name="CancellationDetails" component={CancellationDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
