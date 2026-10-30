import React, {useState} from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
} from "react-native";
import {useTheme} from "../../theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  isPassword = false,
  ...rest
}) => {
  const {theme} = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getBorderColor = () => {
    if (error) return theme.colors.error;
    if (isFocused) return theme.colors.borderFocus;
    return theme.colors.border;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Text
          style={[
            theme.typography.label,
            {color: theme.colors.textPrimary, marginBottom: 6},
          ]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor: getBorderColor(),
            borderRadius: theme.radius.input,
            height: theme.dimensions.inputHeight,
          },
        ]}>
        {leftIcon ? <View style={styles.iconLeft}>{leftIcon}</View> : null}

        <TextInput
          placeholderTextColor={theme.colors.textPlaceholder}
          secureTextEntry={isPassword && !showPassword}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            theme.typography.body1,
            {
              color: theme.colors.textPrimary,
              paddingLeft: leftIcon ? 8 : 16,
              paddingRight: rightIcon || isPassword ? 8 : 16,
            },
            inputStyle,
          ]}
          {...rest}
        />

        {isPassword ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(prev => !prev)}
            style={styles.iconRight}>
            <Text
              style={[
                theme.typography.caption,
                {color: theme.colors.textSecondary},
              ]}>
              {showPassword ? "Hide" : "Show"}
            </Text>
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.iconRight}>{rightIcon}</View>
        ) : null}
      </View>

      {error ? (
        <Text
          style={[
            theme.typography.caption,
            {color: theme.colors.error, marginTop: 4},
          ]}>
          {error}
        </Text>
      ) : helperText ? (
        <Text
          style={[
            theme.typography.caption,
            {color: theme.colors.textTertiary, marginTop: 4},
          ]}>
          {helperText}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  input: {
    flex: 1,
    height: "100%",
  },
  iconLeft: {
    paddingLeft: 14,
  },
  iconRight: {
    paddingRight: 14,
    justifyContent: "center",
  },
});
