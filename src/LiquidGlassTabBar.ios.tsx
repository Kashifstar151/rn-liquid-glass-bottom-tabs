import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
  type ColorValue,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import LiquidGlassContainerView from './LiquidGlassViewContainerNativeComponent';
import LiquidGlassView from './LiquidGlassViewNativeComponent';

const AnimatedLiquidGlassView =
  Animated.createAnimatedComponent(LiquidGlassView);

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
      config?: {
        duration?: number;
        easing?: (value: number) => number;
      };
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
  /**
   * Animation used when the active pill moves between tabs.
   * Defaults to a spring that mirrors the iOS native feel.
   */
  animation?: LiquidGlassTabBarAnimation;
  /**
   * Allow the user to drag the active pill across tabs.
   * On release, snaps to the nearest tab. Defaults to false.
   */
  draggable?: boolean;
  /**
   * Fraction of a tab's width the drag must cross before snapping
   * to the next tab. Range 0–1. Defaults to 0.5.
   */
  dragSnapThreshold?: number;
  /**
   * Border radius of the active pill. Defaults to a fully rounded pill (999).
   */
  pillBorderRadius?: number;
  style?: StyleProp<ViewStyle>;
  tabStyle?: StyleProp<ViewStyle>;
  activeTabStyle?: StyleProp<ViewStyle>;
};

const PADDING = 6;

const DEFAULT_ANIMATION: LiquidGlassTabBarAnimation = {
  type: 'spring',
  config: { damping: 18, stiffness: 200, mass: 0.9 },
};

function runAnimation(
  value: Animated.Value,
  toValue: number,
  animation: LiquidGlassTabBarAnimation
) {
  if (animation.type === 'none') {
    value.setValue(toValue);
    return { start: (cb?: () => void) => cb?.() };
  }
  if (animation.type === 'timing') {
    return Animated.timing(value, {
      toValue,
      duration: animation.config?.duration ?? 250,
      easing: animation.config?.easing ?? Easing.out(Easing.cubic),
      useNativeDriver: false,
    });
  }
  return Animated.spring(value, {
    toValue,
    damping: animation.config?.damping ?? 18,
    stiffness: animation.config?.stiffness ?? 200,
    mass: animation.config?.mass ?? 0.9,
    overshootClamping: animation.config?.overshootClamping ?? false,
    useNativeDriver: false,
  });
}

export const LiquidGlassTabBar: React.FC<LiquidGlassTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
  effect = 'regular',
  tintColor,
  activeTintColor,
  colorScheme = 'system',
  spacing = 20,
  animation = DEFAULT_ANIMATION,
  draggable = false,
  dragSnapThreshold = 0.5,
  pillBorderRadius = 999,
  style,
  tabStyle,
  activeTabStyle,
}) => {
  const [width, setWidth] = useState(0);
  const tabCount = Math.max(tabs.length, 1);
  const innerWidth = Math.max(width - PADDING * 2, 0);
  const tabWidth = innerWidth / tabCount;

  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const dragStartXRef = useRef(0);
  const isDraggingRef = useRef(false);
  const rippleRafRef = useRef<number | null>(null);
  const latestPillXForRippleRef = useRef(0);

  useEffect(
    () => () => {
      if (rippleRafRef.current != null) {
        cancelAnimationFrame(rippleRafRef.current);
        rippleRafRef.current = null;
      }
    },
    []
  );

  // Per-tab "ripple" scale — each tab grows as the droplet passes over it.
  const tabScales = useMemo(
    () => tabs.map(() => new Animated.Value(1)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tabs.length]
  );

  const updateTabRipple = (pillX: number) => {
    if (tabWidth <= 0) return;
    tabs.forEach((_, i) => {
      const dist = Math.abs(pillX - i * tabWidth) / tabWidth;
      const proximity = Math.max(1 - dist, 0); // 1 directly under, 0 far away
      // Slightly subtler ripple = fewer visible repaints while dragging.
      tabScales[i]?.setValue(1 + proximity * 0.22);
    });
  };

  const resetTabRipples = () => {
    tabScales.forEach((v) =>
      Animated.spring(v, {
        toValue: 1,
        damping: 16,
        stiffness: 200,
        useNativeDriver: false,
      }).start()
    );
  };

  // Animate pill to active tab when activeIndex changes (and not while dragging)
  useEffect(() => {
    if (isDraggingRef.current) return;
    runAnimation(translateX, activeIndex * tabWidth, animation).start?.();
  }, [activeIndex, tabWidth, translateX, animation]);

  const panResponder = useMemo(() => {
    if (!draggable) return null;
    return PanResponder.create({
      // Don't claim taps — let Pressables handle them.
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      // Claim once the user moves horizontally enough — capture from children too.
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onMoveShouldSetPanResponderCapture: (_, g) =>
        Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        dragStartXRef.current = activeIndex * tabWidth;
        translateX.stopAnimation();
        latestPillXForRippleRef.current = dragStartXRef.current;
        updateTabRipple(dragStartXRef.current);
        Animated.spring(scale, {
          // Smaller grab magnification = less glass/layout churn while dragging.
          toValue: 1.12,
          damping: 16,
          stiffness: 260,
          mass: 0.55,
          useNativeDriver: false,
        }).start();
      },
      onPanResponderMove: (_, g) => {
        const next = Math.min(
          Math.max(dragStartXRef.current + g.dx, 0),
          (tabCount - 1) * tabWidth
        );
        translateX.setValue(next);
        latestPillXForRippleRef.current = next;
        if (rippleRafRef.current == null) {
          rippleRafRef.current = requestAnimationFrame(() => {
            rippleRafRef.current = null;
            updateTabRipple(latestPillXForRippleRef.current);
          });
        }
      },
      onPanResponderRelease: (_, g) => {
        if (rippleRafRef.current != null) {
          cancelAnimationFrame(rippleRafRef.current);
          rippleRafRef.current = null;
        }
        const finalX = Math.min(
          Math.max(dragStartXRef.current + g.dx, 0),
          (tabCount - 1) * tabWidth
        );
        const exact = tabWidth > 0 ? finalX / tabWidth : 0;
        const base = Math.floor(exact);
        const frac = exact - base;
        const snapped =
          frac >= dragSnapThreshold
            ? Math.min(base + 1, tabCount - 1)
            : Math.max(base, 0);
        isDraggingRef.current = false;
        runAnimation(translateX, snapped * tabWidth, animation).start?.();
        Animated.spring(scale, {
          toValue: 1,
          damping: 16,
          stiffness: 220,
          mass: 0.8,
          useNativeDriver: false,
        }).start();
        resetTabRipples();
        if (snapped !== activeIndex) {
          onTabPress(snapped, tabs[snapped]!);
        }
      },
      onPanResponderTerminate: () => {
        if (rippleRafRef.current != null) {
          cancelAnimationFrame(rippleRafRef.current);
          rippleRafRef.current = null;
        }
        isDraggingRef.current = false;
        runAnimation(translateX, activeIndex * tabWidth, animation).start?.();
        Animated.spring(scale, {
          toValue: 1,
          damping: 16,
          stiffness: 220,
          useNativeDriver: false,
        }).start();
        resetTabRipples();
      },
    });
    // updateTabRipple/resetTabRipples are stable closures over refs/state
    // already in deps; including them would invalidate the responder every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    draggable,
    activeIndex,
    tabWidth,
    tabCount,
    dragSnapThreshold,
    animation,
    onTabPress,
    tabs,
    translateX,
    scale,
    tabScales,
  ]);

  return (
    <View
      style={[styles.wrapper, style]}
      onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
      {...(panResponder?.panHandlers ?? {})}
    >
      <LiquidGlassContainerView
        spacing={spacing}
        pointerEvents="none"
        style={StyleSheet.absoluteFill}
      >
        {/* Bar background */}
        <LiquidGlassView
          effect={effect === 'none' ? 'none' : 'clear'}
          tintColor={tintColor}
          colorScheme={colorScheme}
          style={[StyleSheet.absoluteFill, styles.bar]}
        />
        {/* Active droplet pill */}
        {tabWidth > 0 ? (
          <AnimatedLiquidGlassView
            interactive
            effect={effect}
            tintColor={activeTintColor ?? tintColor}
            colorScheme={colorScheme}
            style={[
              styles.activePill,
              {
                width: tabWidth,
                borderRadius: pillBorderRadius,
                transform: [{ translateX }, { scale }],
              },
              activeTabStyle,
            ]}
          />
        ) : null}
      </LiquidGlassContainerView>

      {/* Tap targets */}
      <View style={styles.row}>
        {tabs.map((tab, index) => {
          const isActive = index === activeIndex;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={tab.accessibilityLabel}
              onPress={() => onTabPress(index, tab)}
              style={[styles.tab, tabStyle]}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  { transform: [{ scale: tabScales[index] ?? 1 }] },
                ]}
              >
                {tab.icon != null ? (
                  <View style={styles.iconWrap}>{tab.icon}</View>
                ) : null}
                {tab.label != null ? (
                  <View style={styles.labelWrap}>{tab.label}</View>
                ) : null}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 32,
  },
  bar: {
    borderRadius: 32,
  },
  activePill: {
    position: 'absolute',
    top: PADDING,
    bottom: PADDING,
    left: PADDING,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: PADDING,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
