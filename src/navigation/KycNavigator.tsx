import React from "react";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {KycStackParamList} from "./types";
import {PersonalInfoScreen} from "../screens/Kyc/PersonalInfoScreen";
import {PrimaryAddressScreen} from "../screens/Kyc/PrimaryAddressScreen";
import {IdUploadScreen} from "../screens/Kyc/IdUploadScreen";
import {ExperienceScreen} from "../screens/Kyc/ExperienceScreen";
import {AddWorkExperienceScreen} from "../screens/Kyc/AddWorkExperienceScreen";
import {AddCertificateScreen} from "../screens/Kyc/AddCertificateScreen";
import {BankDetailsScreen} from "../screens/Kyc/BankDetailsScreen";
import {SelfieScreen} from "../screens/Kyc/SelfieScreen";
import {KycReviewScreen} from "../screens/Kyc/KycReviewScreen";

const Stack = createNativeStackNavigator<KycStackParamList>();

export const KycNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}} initialRouteName="PersonalInfo">
    <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
    <Stack.Screen name="PrimaryAddress" component={PrimaryAddressScreen} />
    <Stack.Screen name="IdUpload" component={IdUploadScreen} />
    <Stack.Screen name="Experience" component={ExperienceScreen} />
    <Stack.Screen name="AddWorkExperience" component={AddWorkExperienceScreen} />
    <Stack.Screen name="AddCertificate" component={AddCertificateScreen} />
    <Stack.Screen name="BankDetails" component={BankDetailsScreen} />
    <Stack.Screen name="Selfie" component={SelfieScreen} />
    <Stack.Screen name="KycReview" component={KycReviewScreen} />
  </Stack.Navigator>
);
