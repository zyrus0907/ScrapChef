import React from 'react';
import { Platform, Text, useWindowDimensions, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PantryScreen } from '../screens/pantry/PantryScreen';
import { AddItemScreen } from '../screens/pantry/AddItemScreen';
import { ScanScreen } from '../screens/pantry/ScanScreen';
import { ReceiptScanScreen } from '../screens/pantry/ReceiptScanScreen';
import { ItemDetailScreen } from '../screens/pantry/ItemDetailScreen';
import { RecipesScreen } from '../screens/recipes/RecipesScreen';
import { RecipeDetailScreen } from '../screens/recipes/RecipeDetailScreen';
import { CostDashboardScreen } from '../screens/costs/CostDashboardScreen';
import { ShoppingScreen } from '../screens/shopping/ShoppingScreen';
import { ShoppingListDetailScreen } from '../screens/shopping/ShoppingListDetailScreen';
import { RecipeImportScreen } from '../screens/shopping/RecipeImportScreen';
import { LeftoverChefScreen } from '../screens/assistant/LeftoverChefScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { HeaderBell } from '../components/HeaderBell';
import { Typography, useColors, type Palette } from '../theme';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const PantryStack = createNativeStackNavigator();
const RecipeStack = createNativeStackNavigator();
const ShoppingStack = createNativeStackNavigator();

const makeScreenOptions = (C: Palette) => ({
  headerStyle: { backgroundColor: C.surface },
  headerTintColor: C.textPrimary,
  headerTitleStyle: { ...Typography.titleMedium, color: C.textPrimary },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: C.background },
});

const smallTitle = (C: Palette) => ({ fontSize: 12, fontWeight: '500', color: C.textPrimary }) as any;

const HeaderLink = ({ label, onPress, C }: { label: string; onPress: () => void; C: Palette }) => (
  <Text onPress={onPress} style={{ color: C.gold, fontSize: 13, fontWeight: '600' }}>
    {label}
  </Text>
);

const HomeNavigator = () => {
  const C = useColors();
  const screenOptions = makeScreenOptions(C);
  const titleSmall = smallTitle(C);
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={({ navigation }) => ({
          headerTitle: () => (
            <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 6, color: C.gold }}>
              ✦ SMART PANTRY
            </Text>
          ),
          headerLeft: () => <HeaderBell />,
          headerRight: () => (
            <Text
              onPress={() => navigation.navigate('Settings')}
              style={{ color: C.textSecondary, marginRight: 16, fontSize: 18 }}
            >
              ⚙︎
            </Text>
          ),
        })}
      />
      <HomeStack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'ALERTS', headerTitleStyle: titleSmall }} />
      <HomeStack.Screen name="LeftoverChef" component={LeftoverChefScreen} options={{ title: 'LEFTOVER CHEF', headerTitleStyle: titleSmall }} />
      <HomeStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'SETTINGS', headerTitleStyle: titleSmall }} />
    </HomeStack.Navigator>
  );
};

const PantryNavigator = () => {
  const C = useColors();
  const screenOptions = makeScreenOptions(C);
  const titleSmall = smallTitle(C);
  return (
    <PantryStack.Navigator screenOptions={screenOptions}>
      <PantryStack.Screen
        name="PantryList"
        component={PantryScreen}
        options={({ navigation }) => ({
          title: 'PANTRY',
          headerTitleStyle: titleSmall,
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 14, marginRight: 16 }}>
              <HeaderLink label="🧾 Receipt" onPress={() => navigation.navigate('ReceiptScan')} C={C} />
              <HeaderLink label="⊞ Scan" onPress={() => navigation.navigate('Scan')} C={C} />
            </View>
          ),
        })}
      />
      <PantryStack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'ADD ITEM', headerTitleStyle: titleSmall }} />
      <PantryStack.Screen name="Scan" component={ScanScreen} options={{ title: 'SCAN BARCODE', headerTitleStyle: titleSmall }} />
      <PantryStack.Screen name="ReceiptScan" component={ReceiptScanScreen} options={{ title: 'SCAN RECEIPT', headerTitleStyle: titleSmall }} />
      <PantryStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: '' }} />
    </PantryStack.Navigator>
  );
};

const RecipeNavigator = () => {
  const C = useColors();
  const screenOptions = makeScreenOptions(C);
  const titleSmall = smallTitle(C);
  return (
    <RecipeStack.Navigator screenOptions={screenOptions}>
      <RecipeStack.Screen name="RecipeList" component={RecipesScreen} options={{ title: 'RECIPES', headerTitleStyle: titleSmall }} />
      <RecipeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
    </RecipeStack.Navigator>
  );
};

const ShoppingNavigator = () => {
  const C = useColors();
  const screenOptions = makeScreenOptions(C);
  const titleSmall = smallTitle(C);
  return (
    <ShoppingStack.Navigator screenOptions={screenOptions}>
      <ShoppingStack.Screen
        name="ShoppingLists"
        component={ShoppingScreen}
        options={({ navigation }) => ({
          title: 'SHOPPING',
          headerTitleStyle: titleSmall,
          headerRight: () => (
            <View style={{ marginRight: 16 }}>
              <HeaderLink label="🍳 Import" onPress={() => navigation.navigate('RecipeImport')} C={C} />
            </View>
          ),
        })}
      />
      <ShoppingStack.Screen name="ShoppingListDetail" component={ShoppingListDetailScreen} options={{ title: 'LIST', headerTitleStyle: titleSmall }} />
      <ShoppingStack.Screen name="RecipeImport" component={RecipeImportScreen} options={{ title: 'IMPORT RECIPE', headerTitleStyle: titleSmall }} />
    </ShoppingStack.Navigator>
  );
};

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => {
  const C = useColors();
  return (
    <Text style={{ fontSize: focused ? 18 : 16, color: focused ? C.gold : C.textMuted }}>{icon}</Text>
  );
};

export const AppNavigator = () => {
  const C = useColors();
  const { width } = useWindowDimensions();
  // On wide web the left Sidebar replaces the bottom tabs.
  const hideTabs = Platform.OS === 'web' && width >= 900;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          display: hideTabs ? 'none' : 'flex',
          backgroundColor: C.surface,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: C.gold,
        tabBarInactiveTintColor: C.textMuted,
        tabBarLabelStyle: { ...Typography.caption, letterSpacing: 1.5 },
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeNavigator} options={{ title: 'HOME', tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} /> }} />
      <Tab.Screen name="Pantry" component={PantryNavigator} options={{ title: 'PANTRY', tabBarIcon: ({ focused }) => <TabIcon icon="◫" focused={focused} /> }} />
      <Tab.Screen name="Recipes" component={RecipeNavigator} options={{ title: 'RECIPES', tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} /> }} />
      <Tab.Screen name="Shopping" component={ShoppingNavigator} options={{ title: 'SHOPPING', tabBarIcon: ({ focused }) => <TabIcon icon="◰" focused={focused} /> }} />
      <Tab.Screen
        name="Costs"
        component={CostDashboardScreen}
        options={{
          title: 'COSTS',
          headerShown: true,
          headerStyle: { backgroundColor: C.surface },
          headerShadowVisible: false,
          headerTitle: () => (
            <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 4, color: C.textPrimary }}>ANALYTICS</Text>
          ),
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};
