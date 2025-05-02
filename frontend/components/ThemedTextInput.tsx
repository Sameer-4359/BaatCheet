import { TextInput, type TextInputProps, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedTextInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  lightBackground?: string;
  darkBackground?: string;
  lightBorder?: string;
  darkBorder?: string;
  type?: 'default' | 'rounded' | 'underline';
};

export function ThemedTextInput({
  style,
  lightColor,
  darkColor,
  lightBackground,
  darkBackground,
  lightBorder,
  darkBorder,
  type = 'default',
  ...rest
}: ThemedTextInputProps) {
  const textColor = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const backgroundColor = useThemeColor(
    { light: lightBackground, dark: darkBackground },
    'card'
  );
  const borderColor = useThemeColor(
    { light: lightBorder, dark: darkBorder },
    'border'
  );
  const placeholderColor = useThemeColor({}, 'icon');

  return (
    <TextInput
      style={[
        styles.base,
        { color: textColor, backgroundColor, borderColor },
        type === 'rounded' ? styles.rounded : undefined,
        type === 'underline' ? styles.underline : undefined,
        style,
      ]}
      placeholderTextColor={placeholderColor}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1,
    padding: 12,
    marginVertical: 8,
    fontSize: 16,
  },
  rounded: {
    borderRadius: 8,
  },
  underline: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
});