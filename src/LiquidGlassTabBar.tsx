import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ColorValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type LiquidGlassTabBarItem = {
  key: string;
  icon?: React.ReactNode;
  label?: React.ReactNode;
  accessibilityLabel?: string;
};

export type LiquidGlassTabBarAnimation =
  | {
      type: 'spring';
      config?: {
        damping?: number;
        stiffness?: number;
        mass?: number;
        overshootClamping?: boolean;
      };
    }
  | {
      type: 'timing';
      config?: { duration?: number; easing?: (value: number) => number };
    }
  | { type: 'none' };

export type LiquidGlassTabBarProps = {
  tabs: LiquidGlassTabBarItem[];
  activeIndex: number;
  onTabPress: (index: number, tab: LiquidGlassTabBarItem) => void;
  effect?: 'clear' | 'regular' | 'none';
  tintColor?: ColorValue;
  activeTintColor?: ColorValue;
  colorScheme?: 'light' | 'dark' | 'system';
  spacing?: number;
  animation?: LiquidGlassTabBarAnimation;
  draggable?: boolean;
  dragSnapThreshold?: number;
  pillBorderRadius?: number;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
};

/**
 * Non-iOS fallback: a plain row of pressable tabs without the glass effect.
 */
export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
  style,
  tabStyle,
  activeTabStyle,
}) => {
  return (
    <View style={[styles.container, style]}>
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.accessibilityLabel}
            onPress={() => onTabPress(index, tab)}
            style={[
              styles.tab,
              tabStyle,
              isActive && styles.activeTab,
              isActive && activeTabStyle,
            ]}
          >
            {tab.icon != null ? (
              <View style={styles.icon}>{tab.icon}</View>
            ) : null}
            {tab.label != null ? (
              <View style={styles.label}>{tab.label}</View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: 6,
    borderRadius: 32,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 24,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
