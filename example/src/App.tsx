import {
  ScrollView,
  StyleSheet,
  Text,
  ImageBackground,
  useWindowDimensions,
  Animated,
  View,
  Pressable,
  PlatformColor,
} from 'react-native';
import {
  LiquidGlassView,
  LiquidGlassContainerView,
  LiquidGlassTabBar,
  isLiquidGlassSupported,
  type LiquidGlassViewProps,
} from 'rn-liquid-glass-bottom-tabs';
import { useEffect, useState } from 'react';
import * as DropdownMenu from 'zeego/dropdown-menu';

function DropdownMenuButton({ title }: { title?: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Text style={styles.dropdownTrigger}>{title}</Text>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item key="first">
          <DropdownMenu.ItemTitle>First</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key="second">
          <DropdownMenu.ItemTitle>Second</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
        <DropdownMenu.Item key="third">
          <DropdownMenu.ItemTitle>Third</DropdownMenu.ItemTitle>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function LiquidToolBar() {
  return (
    <LiquidGlassView style={styles.toolbar}>
      <DropdownMenuButton title="File" />
      <DropdownMenuButton title="Edit" />
      <DropdownMenuButton title="View" />
      <DropdownMenuButton title="Window" />
      <DropdownMenuButton title="Help" />
    </LiquidGlassView>
  );
}

const AnimatedLiquidGlassView =
  Animated.createAnimatedComponent(LiquidGlassView);

export default function App() {
  const { height } = useWindowDimensions();

  return (
    <>
      <ImageBackground
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height,
          width: '100%',
          position: 'absolute',
        }}
        source={require('./images/image126.png')}
      />
      {/* <ScrollView style={styles.container}>
        <WeatherWidgets />
        <Button />
        <MergingCircles />
      </ScrollView> */}
      <BottomTabBarExample />

      <LiquidToolBar />
    </>
  );
}

function BottomTabBarExample() {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = [
    {
      key: 'home',
      icon: <Text style={styles.tabIcon}>🏠</Text>,
      label: <Text style={styles.tabLabel}>Home</Text>,
    },
    {
      key: 'search',
      icon: <Text style={styles.tabIcon}>🔍</Text>,
      label: <Text style={styles.tabLabel}>Search</Text>,
    },
    {
      key: 'profile',
      icon: <Text style={styles.tabIcon}>👤</Text>,
      label: <Text style={styles.tabLabel}>Profile</Text>,
    },
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
      style={styles.tabBar}
    />
  );
}

function Button() {
  const [isGlassy, setIsGlassy] = useState(true);
  return (
    <Pressable onPress={() => setIsGlassy((prev) => !prev)}>
      <LiquidGlassView
        style={styles.button}
        colorScheme="dark"
        effect={isGlassy ? 'regular' : 'none'}
      >
        <Text
          style={{
            padding: 20,
            color: 'white',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          Click me
        </Text>
      </LiquidGlassView>
    </Pressable>
  );
}

interface WeatherWidgetProps extends LiquidGlassViewProps {
  city: string;
  temperature: number;
  description: string;
}

function WeatherWidget({
  city,
  temperature,
  description,
  ...props
}: WeatherWidgetProps) {
  return (
    <LiquidGlassView
      style={[
        styles.weather,
        !isLiquidGlassSupported && { backgroundColor: 'rgba(0,0,0,0.4)' },
      ]}
      {...props}
    >
      <Text style={styles.small}>{city}</Text>
      <Text style={styles.temperature}>{temperature}°</Text>
      <Text style={styles.icon}>☀</Text>
      <Text style={styles.small}>{description}</Text>
    </LiquidGlassView>
  );
}

function WeatherWidgets() {
  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <WeatherWidget
          city="Wrocław"
          temperature={25}
          description="Sunny"
          effect="clear"
          interactive
          tintColor={'orange'}
        />
        <WeatherWidget
          city="Miami"
          temperature={35}
          description="Sunny"
          interactive
          colorScheme="dark"
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        <WeatherWidget
          city="Warsaw"
          temperature={20}
          description="Sunny"
          interactive
          effect="clear"
        />
        <WeatherWidget
          city="Szczecin"
          temperature={22}
          description="Sunny"
          interactive
        />
      </View>
    </View>
  );
}

function MergingCircles() {
  const [translateX] = useState(() => new Animated.Value(0));
  const [merged, setMerged] = useState(false);

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: merged ? -50 : 30,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [translateX, merged]);

  return (
    <Pressable
      style={styles.circles}
      onPress={() => setMerged((prev) => !prev)}
    >
      <LiquidGlassContainerView
        spacing={20}
        style={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <AnimatedLiquidGlassView style={styles.circle} effect="clear">
          <Text style={{ fontSize: 30, color: 'white' }}>1</Text>
        </AnimatedLiquidGlassView>
        <AnimatedLiquidGlassView
          effect="clear"
          style={[styles.circle, { transform: [{ translateX }] }]}
        >
          <Text style={{ fontSize: 30, color: 'white' }}>2</Text>
        </AnimatedLiquidGlassView>
      </LiquidGlassContainerView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  box: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 15,
    padding: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sliderValue: {
    color: 'white',
    fontSize: 14,
    marginTop: 10,
  },
  button: {
    alignItems: 'center',
    borderRadius: 20,
    marginBottom: 20,
  },
  weather: {
    borderRadius: 20,
    borderCurve: 'continuous',
    minWidth: 170,
    padding: 20,
  },
  small: {
    color: 'white',
    fontSize: 24,
  },
  icon: {
    color: 'yellow',
    fontSize: 30,
  },
  temperature: {
    color: 'white',
    fontSize: 60,
  },
  circle: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    borderRadius: 100,
    color: 'white',
  },
  circles: {
    flexDirection: 'row',
    gap: 10,
  },
  toolbar: {
    flexDirection: 'row',
    gap: 10,
    padding: 10,
    position: 'absolute',
    borderRadius: 40,
    bottom: 140,
    left: 20,
    right: 20,
    justifyContent: 'center',
  },
  tabBar: {
    position: 'absolute',
    bottom: 70,
    left: 20,
    right: 20,
  },
  tabIcon: {
    fontSize: 22,
  },
  tabLabel: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  dropdownTrigger: {
    padding: 10,
    color: PlatformColor('labelColor'),
    fontFamily: 'System',
    fontWeight: '600',
  },
});
