You're asking a great architectural question. Let me break down both approaches and help you decide what works best for your needs.

## Option 1: Themed Components (Current Approach)
**Pros:**
- Most React Native-like pattern (composition over configuration)
- Components automatically adapt to theme changes
- Type-safe with your color system
- Easy to modify per-instance styles

**Cons:**
- Slightly more boilerplate
- Need to create wrapper components

## Option 2: Central Styles Object
**Pros:**
- Single source of truth for styles
- Simple to understand at a glance
- Easy to modify globally

**Cons:**
- Less flexible for one-off modifications
- Harder to handle theme changes dynamically
- May lead to prop-drilling if overused

## Hybrid Solution (Recommended)

Here's how to implement a **central styles system** that still respects your theme:

### 1. First, create `app/constants/Styles.ts`

```tsx
import { StyleSheet } from 'react-native';
import { Colors } from './Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export const makeStyles = () => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    header: {
      fontSize: 24,
      color: colors.text,
      marginBottom: 20,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      color: colors.text,
      padding: 15,
      marginBottom: 15,
      borderRadius: 8,
      fontSize: 16,
    },
    // Add more shared styles as needed
  });
};

// For components that can't use hooks
export const staticStyles = StyleSheet.create({
  baseInput: {
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  // Other non-theme-dependent styles
});
```

### 2. Usage in Login Screen

```tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { makeStyles } from '@/constants/Styles';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function LoginScreen() {
  const styles = makeStyles(); // Dynamic styles
  const primaryColor = useThemeColor({}, 'primary');
  
  // ... rest of your component logic

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={useThemeColor({}, 'icon')}
        // ... other props
      />
      <Button 
        title="Login" 
        color={primaryColor}
        // ... other props
      />
    </View>
  );
}
```

## Key Advantages of This Approach

1. **Theme-Aware**: Styles automatically update with theme changes
2. **Centralized**: All styles in one place, but still dynamic
3. **Flexible**: Can override individual styles when needed
4. **Type-Safe**: Leverages your existing Colors system
5. **Performance**: Uses StyleSheet.create for optimization

## When to Use Each Approach

| Use Case | Recommended Approach |
|----------|----------------------|
| App-wide consistent components | Themed Components |
| Screens with complex layouts | makeStyles() |
| Simple one-off components | Inline styles |
| Non-theme dependent styles | staticStyles |

## Advanced Tip: Variant Support

Enhance your `Styles.ts` to handle variants:

```tsx
// In Styles.ts
export const makeInputStyles = (variant: 'default' | 'error' = 'default') => {
  const colors = Colors[useColorScheme() ?? 'light'];
  
  return StyleSheet.create({
    input: {
      // ... base styles
      borderColor: variant === 'error' ? colors.danger : colors.border,
    }
  });
};

// Usage:
const inputStyles = makeInputStyles('error');
```

This gives you the best of both worlds - centralized control with dynamic theming capabilities. Would you like me to show how to extend this further with TypeScript generics for even better type safety?