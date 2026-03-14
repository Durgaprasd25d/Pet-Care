import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps, ViewStyle, Pressable } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../../theme/theme';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: any;
  rightIcon?: any;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
}

export const Input = forwardRef<TextInput, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => inputRef.current!);

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={handleContainerPress}
        style={[
          styles.inputContainer,
          isFocused && styles.inputFocused,
          error ? styles.inputError : null,
        ]}
      >
        {leftIcon && (
          <MaterialDesignIcons 
            name={leftIcon} 
            size={20} 
            color={isFocused ? COLORS.primary : COLORS.textLight} 
            style={styles.leftIcon} 
          />
        )}
        <TextInput
          ref={inputRef}
          style={[styles.input, style]}
          placeholderTextColor={COLORS.textLight}
          onFocus={handleFocus}
          onBlur={handleBlur}
          underlineColorAndroid="transparent"
          {...props}
        />
        {rightIcon && (
          <MaterialDesignIcons
            name={rightIcon}
            size={20}
            color={COLORS.textLight}
            style={styles.rightIcon}
            onPress={onRightIconPress}
          />
        )}
      </Pressable>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    minHeight: 56,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: SPACING.md,
    minHeight: 48,
  },
  leftIcon: {
    marginRight: SPACING.sm,
    marginTop: SPACING.md,
  },
  rightIcon: {
    marginLeft: SPACING.sm,
    marginTop: SPACING.md,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: 4,
  },
});
