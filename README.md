<div align="center">
  <h1>rn-liquid-glass-bottom-tabs 💧</h1>

[![npm version](https://img.shields.io/npm/v/rn-liquid-glass-bottom-tabs?style=for-the-badge)](https://www.npmjs.org/package/rn-liquid-glass-bottom-tabs)
[![npm downloads](https://img.shields.io/npm/dm/rn-liquid-glass-bottom-tabs.svg?style=for-the-badge)](https://www.npmjs.org/package/rn-liquid-glass-bottom-tabs)
[![mit licence](https://img.shields.io/dub/l/vibe-d.svg?style=for-the-badge)](https://github.com/Kashifstar151/rn-liquid-glass-bottom-tabs/blob/main/LICENSE)

A drop-in **iOS 26 liquid-glass bottom tab bar** for React Native — with a draggable droplet pill, ripple animation, and configurable spring/timing animations.

</div>

## Demo

▶️ **[Watch the demo](https://www.kapwing.com/videos/69fe53233c895a572773f0f9)**

## Highlights

- 💧 **`LiquidGlassTabBar`** — bottom tab bar built on iOS 26's native `UIGlassEffect`
- 👆 **Drag-to-select** — swipe across tabs; the droplet pill follows your finger and snaps to the nearest tab on release
- 🌊 **Droplet ripple** — tabs flex/scale as the droplet passes over them, like water deforming what's underneath
- 🪄 **Magnify on grab** — pill grows symmetrically (top/bottom/left/right) the moment you start dragging
- ⚙️ **Configurable animation** — spring or timing, with full config passthrough
- 🎨 **Customizable** — tint color, active tint color, color scheme, pill border radius, snap threshold
- 📱 Graceful fallback to a plain row on iOS < 26 / Android

Also re-exports the underlying primitives so you can build other glass UIs:

- `LiquidGlassView` — single glass surface
- `LiquidGlassContainerView` — merges sibling glass elements (the morph effect)
- `isLiquidGlassSupported` — runtime feature flag

## Installation

```bash
npm install rn-liquid-glass-bottom-tabs
# or
yarn add rn-liquid-glass-bottom-tabs
```

> [!WARNING]
> Compile your app with **Xcode ≥ 26** and **React Native ≥ 0.80**. New Architecture (Fabric) is required.

> [!WARNING]
> Not supported in [Expo Go](https://expo.dev/go) — use a development build.

## Quick start

```tsx
import { useState } from 'react';
import { Text } from 'react-native';
import { LiquidGlassTabBar } from 'rn-liquid-glass-bottom-tabs';

export function BottomTabs() {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    { key: 'home',    icon: <Text>🏠</Text>, label: <Text>Home</Text> },
    { key: 'search',  icon: <Text>🔍</Text>, label: <Text>Search</Text> },
    { key: 'profile', icon: <Text>👤</Text>, label: <Text>Profile</Text> },
  ];

  return (
    <LiquidGlassTabBar
      tabs={tabs}
      activeIndex={activeIndex}
      onTabPress={setActiveIndex}
      draggable
      animation={{
        type: 'spring',
        config: { damping: 16, stiffness: 220, mass: 0.8 },
      }}
      pillBorderRadius={28}
      style={{ position: 'absolute', bottom: 50, left: 20, right: 20 }}
    />
  );
}
```

Icons and labels are arbitrary `ReactNode` — bring your own icon library (Ionicons, Lucide, SF Symbols, emoji, anything).

## Using with React Navigation

If you're using [`@react-navigation/bottom-tabs`](https://reactnavigation.org/docs/bottom-tab-navigator/), pass `LiquidGlassTabBar` as the `tabBar` prop. React Navigation handles routing, focus, deep linking, and screen lifecycles — `LiquidGlassTabBar` just renders the bar UI.

```tsx
import { Text } from 'react-native';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { LiquidGlassTabBar } from 'rn-liquid-glass-bottom-tabs';

const Tab = createBottomTabNavigator();

function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const tabs = state.routes.map((route) => {
    const { options } = descriptors[route.key];
    const label =
      typeof options.tabBarLabel === 'string'
        ? options.tabBarLabel
        : (options.title ?? route.name);

    return {
      key: route.key,
      icon: options.tabBarIcon?.({
        focused: false,
        color: 'white',
        size: 22,
      }),
      label: <Text style={{ color: 'white', fontSize: 13 }}>{label}</Text>,
      accessibilityLabel: options.tabBarAccessibilityLabel,
    };
  });

  return (
    <LiquidGlassTabBar
      tabs={tabs}
      activeIndex={state.index}
      onTabPress={(index) => {
        const route = state.routes[index];
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        if (!event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      }}
      draggable
      style={{ position: 'absolute', bottom: 30, left: 20, right: 20 }}
    />
  );
}

export function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <GlassTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
```

Notes:

- The mapping is straightforward: `state.routes` → `tabs`, `state.index` → `activeIndex`, and tab presses are forwarded through React Navigation's `navigate` (with the `tabPress` event so screens can preventDefault — used for "scroll to top on tap" patterns).
- Pull `tabBarIcon`, `tabBarLabel`, `tabBarAccessibilityLabel` from each route's `descriptor.options` so users can configure tabs from `<Tab.Screen>` like they normally would.
- Set `tabBarStyle: { display: 'none' }` is **not** needed — React Navigation only renders one tab bar (the one you pass via `tabBar`).
- For the screens not to be hidden behind the floating bar, give your screens `paddingBottom: 100` (or use `useSafeAreaInsets` and add the bar height).

## `LiquidGlassTabBar` props

| Prop                | Type                                                                | Default              | Description                                                                                  |
| ------------------- | ------------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `tabs`              | `LiquidGlassTabBarItem[]`                                           | —                    | Array of `{ key, icon?, label?, accessibilityLabel? }`                                        |
| `activeIndex`       | `number`                                                            | —                    | Index of the currently active tab                                                            |
| `onTabPress`        | `(index, tab) => void`                                              | —                    | Fires on tap and on drag-snap                                                                |
| `draggable`         | `boolean`                                                           | `false`              | Enable drag-to-select with droplet ripple + magnify                                          |
| `dragSnapThreshold` | `number` (0–1)                                                      | `0.5`                | Fraction of a tab's width the drag must cross before snapping to the next tab                |
| `animation`         | `{ type: 'spring' \| 'timing' \| 'none'; config?: ... }`            | spring (iOS-like)    | How the pill animates between tabs. Spring / timing configs are passed through to `Animated` |
| `pillBorderRadius`  | `number`                                                            | `999`                | Active-pill border radius. Default is fully rounded; lower for a more rectangular droplet    |
| `effect`            | `'clear' \| 'regular' \| 'none'`                                    | `'regular'`          | Glass effect of the active pill. The bar uses `clear` to keep the pill visually distinct      |
| `tintColor`         | `ColorValue`                                                        | `undefined`          | Tint for the bar background                                                                  |
| `activeTintColor`   | `ColorValue`                                                        | `undefined`          | Tint for the active pill (falls back to `tintColor`)                                          |
| `colorScheme`       | `'light' \| 'dark' \| 'system'`                                     | `'system'`           | Override the glass color scheme                                                              |
| `spacing`           | `number`                                                            | `20`                 | Distance for the underlying `LiquidGlassContainerView` merge effect                          |
| `style`             | `StyleProp<ViewStyle>`                                              | —                    | Outer wrapper style — use to position (e.g. absolute at the bottom)                          |
| `tabStyle`          | `StyleProp<ViewStyle>`                                              | —                    | Style for each tab's `Pressable`                                                             |
| `activeTabStyle`    | `StyleProp<ViewStyle>`                                              | —                    | Extra style for the active pill (merged with the animated transform)                          |

## Animation prop reference

```ts
type LiquidGlassTabBarAnimation =
  | { type: 'spring'; config?: { damping?: number; stiffness?: number; mass?: number; overshootClamping?: boolean } }
  | { type: 'timing'; config?: { duration?: number; easing?: (v: number) => number } }
  | { type: 'none' }; // sets value instantly, no animation
```

## Lower-level primitives

The package also exports the building blocks if you want to compose your own glass UIs:

```tsx
import {
  LiquidGlassView,
  LiquidGlassContainerView,
  isLiquidGlassSupported,
} from 'rn-liquid-glass-bottom-tabs';

if (!isLiquidGlassSupported) {
  // Render a non-glass fallback
}

<LiquidGlassContainerView spacing={20}>
  <LiquidGlassView interactive effect="clear" style={{ width: 100, height: 100, borderRadius: 50 }} />
  <LiquidGlassView interactive effect="clear" style={{ width: 100, height: 100, borderRadius: 50 }} />
</LiquidGlassContainerView>
```

For text inside glass that auto-adapts to the surface behind it, use `PlatformColor`:

```tsx
import { PlatformColor, Text } from 'react-native';
import { LiquidGlassView } from 'rn-liquid-glass-bottom-tabs';

<LiquidGlassView style={{ padding: 20, borderRadius: 20 }}>
  <Text style={{ color: PlatformColor('labelColor') }}>Hello World</Text>
</LiquidGlassView>
```

> [!NOTE]
> On unsupported iOS versions (< 26) and on Android, `LiquidGlassView` renders as a normal `View` without effects — your fallback styles will show through.

## Credits

Built on top of [`@callstack/liquid-glass`](https://github.com/callstack/liquid-glass) by Callstack — the underlying `UIGlassEffect` Fabric component is theirs. This package adds a higher-level `LiquidGlassTabBar` with drag, ripple, and configurable animations.

## License

MIT

## Support the project 💛

If this saved you time and you'd like to contribute, you can support the project on Gumroad — every bit helps keep open-source maintenance going.

👉 **[kkcreek.gumroad.com/l/dqnhp](https://kkcreek.gumroad.com/l/dqnhp)**

A ⭐ on the [GitHub repo](https://github.com/Kashifstar151/rn-liquid-glass-bottom-tabs) is also hugely appreciated — it helps others discover the project.
