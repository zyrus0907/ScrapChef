import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PantryScreen } from '../screens/pantry/PantryScreen';
import { AddItemScreen } from '../screens/pantry/AddItemScreen';
import { ItemDetailScreen } from '../screens/pantry/ItemDetailScreen';
import { RecipesScreen } from '../screens/recipes/RecipesScreen';
import { RecipeDetailScreen } from '../screens/recipes/RecipeDetailScreen';
import { CostDashboardScreen } from '../screens/costs/CostDashboardScreen';
import { ShoppingScreen } from '../screens/shopping/ShoppingScreen';
import { ShoppingListDetailScreen } from '../screens/shopping/ShoppingListDetailScreen';
import { LeftoverChefScreen } from '../screens/assistant/LeftoverChefScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { HeaderBell } from '../components/HeaderBell';
import { Colors, Typography } from '../theme';
import { useAuthStore } from '../store/auth.store';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const PantryStack = createNativeStackNavigator();
const RecipeStack = createNativeStackNavigator();
const ShoppingStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: { ...Typography.titleMedium, color: Colors.textPrimary },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: Colors.background },
};

const titleSmall = { fontSize: 12, fontWeight: '500', color: Colors.textPrimary } as any;

const SignOut = () => {
  const { logout } = useAuthStore();
  return (
    <Text
      style={{ color: Colors.textSecondary, marginRight: 16, fontSize: 11, letterSpacing: 1 }}
      onPress={logout}
    >
      SIGN OUT
    </Text>
  );
};

const HomeNavigator = () => (
  <HomeStack.Navigator screenOptions={screenOptions}>
    <HomeStack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={{
        headerTitle: () => (
          <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 6, color: Colors.gold }}>
            ✦ SMART PANTRY
          </Text>
        ),
        headerLeft: () => <HeaderBell />,
        headerRight: () => <SignOut />,
      }}
    />
    <HomeStack.Screen
      name="Notifications"
      component={NotificationsScreen}
      options={{ title: 'ALERTS', headerTitleStyle: titleSmall }}
    />
    <HomeStack.Screen
      name="LeftoverChef"
      component={LeftoverChefScreen}
      options={{ title: 'LEFTOVER CHEF', headerTitleStyle: titleSmall }}
    />
  </HomeStack.Navigator>
);

const PantryNavigator = () => (
  <PantryStack.Navigator screenOptions={screenOptions}>
    <PantryStack.Screen name="PantryList" component={PantryScreen} options={{ title: 'PANTRY', headerTitleStyle: titleSmall }} />
    <PantryStack.Screen name="AddItem" component={AddItemScreen} options={{ title: 'ADD ITEM', headerTitleStyle: titleSmall }} />
    <PantryStack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: '' }} />
  </PantryStack.Navigator>
);

const RecipeNavigator = () => (
  <RecipeStack.Navigator screenOptions={screenOptions}>
    <RecipeStack.Screen name="RecipeList" component={RecipesScreen} options={{ title: 'RECIPES', headerTitleStyle: titleSmall }} />
    <RecipeStack.Screen name="RecipeDetail" component={RecipeDetailScreen} options={{ title: '' }} />
  </RecipeStack.Navigator>
);

const ShoppingNavigator = () => (
  <ShoppingStack.Navigator screenOptions={screenOptions}>
    <ShoppingStack.Screen name="ShoppingLists" component={ShoppingScreen} options={{ title: 'SHOPPING', headerTitleStyle: titleSmall }} />
    <ShoppingStack.Screen name="ShoppingListDetail" component={ShoppingListDetailScreen} options={{ title: 'LIST', headerTitleStyle: titleSmall }} />
  </ShoppingStack.Navigator>
);

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: focused ? 18 : 16, color: focused ? Colors.gold : Colors.textMuted }}>
    {icon}
  </Text>
);

export const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        borderTopWidth: 1,
        height: 64,
        paddingBottom: 8,
      },
      tabBarActiveTintColor: Colors.gold,
      tabBarInactiveTintColor: Colors.textMuted,
      tabBarLabelStyle: { ...Typography.caption, letterSpacing: 1.5 },
      headerShown: false,
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeNavigator}
      options={{ title: 'HOME', tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} /> }}
    />
    <Tab.Screen
      name="Pantry"
      component={PantryNavigator}
      options={{ title: 'PANTRY', tabBarIcon: ({ focused }) => <TabIcon icon="◫" focused={focused} /> }}
    />
    <Tab.Screen
      name="Recipes"
      component={RecipeNavigator}
      options={{ title: 'RECIPES', tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} /> }}
    />
    <Tab.Screen
      name="Shopping"
      component={ShoppingNavigator}
      options={{ title: 'SHOPPING', tabBarIcon: ({ focused }) => <TabIcon icon="◰" focused={focused} /> }}
    />
    <Tab.Screen
      name="Costs"
      component={CostDashboardScreen}
      options={{
        title: 'COSTS',
        headerShown: true,
        headerStyle: { backgroundColor: Colors.surface },
        headerShadowVisible: false,
        headerTitle: () => (
          <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 4, color: Colors.textPrimary }}>
            ANALYTICS
          </Text>
        ),
        tabBarIcon: ({ focused }) => <TabIcon icon="◎" focused={focused} />,
      }}
    />
  </Tab.Navigator>
);
