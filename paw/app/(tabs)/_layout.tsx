import { Tabs } from 'expo-router/js-tabs';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="map" options={{ title: 'Map' }} />
      <Tabs.Screen name="clinic" options={{ title: 'Clinic' }} />
      <Tabs.Screen name="closet" options={{ title: 'Closet' }} />
      <Tabs.Screen name="collar" options={{ title: 'Collar' }} />
      <Tabs.Screen name="ai" options={{ title: 'PAW AI' }} />
    </Tabs>
  );
}
