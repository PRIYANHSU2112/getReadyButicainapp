import React from "react";
import {NativeStackScreenProps} from "@react-navigation/native-stack";
import {RootStackParamList} from "../../navigation/types";
import {VerificationCenterScreen} from "../Profile/VerificationCenterScreen";

type Props = NativeStackScreenProps<RootStackParamList, "KycPending">;

export const KycPendingScreen: React.FC<Props> = props => {
  return <VerificationCenterScreen {...(props as any)} />;
};
