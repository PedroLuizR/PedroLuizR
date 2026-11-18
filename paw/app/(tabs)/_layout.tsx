import { Tabs } from 'expo-router/js-tabs';
import { BottomTabBar } from '../../src/components/BottomTabBar';
import { colors } from '../../src/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="mapa" options={{ title: 'Mapa' }} />
      <Tabs.Screen name="clinica" options={{ title: 'Clínica' }} />
      <Tabs.Screen name="closet" options={{ title: 'Closet' }} />
      <Tabs.Screen name="coleira" options={{ title: 'Coleira' }} />
      <Tabs.Screen name="ia" options={{ title: 'PAW IA' }} />
    </Tabs>
  );
}
