import React from 'react';
import { Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { PantryScreen } from '../screens/pantry/PantryScreen';
import { AddItemScreen } from '../screens/pantry/AddItemScreen';
import { ItemDetailScreen } from '../screens/pantry/ItemDetailScreen';
import { RecipesScreen } from '../screens/recipes/RecipesScreen';
import { RecipeDetailScreen } from '../screens/recipes/RecipeDetailScreen';
import { CostDashboardScreen } from '../screens/costs/CostDashboardScreen';
import { Colors, Typography } from '../theme';
import { useAuthStore } from '../store/auth.store';

const Tab = createBottomTabNavigator();
const PantryStack = createNativeStackNavigator();
const RecipeStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.surface },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: { ...Typography.titleMedium, color: Colors.textPrimary },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: Colors.background },
};

const PantryNavigator = () => (
  <PantryStack.Navigator screenOptions={screenOptions}>
    <PantryStack.Screen
      name="PantryList"
      component={PantryScreen}
      options={{ title: 'PANTRY', headerTitleStyle: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary } as any }}
    />
    <PantryStack.Screen
      name="AddItem"
      component={AddItemScreen}
      options={{ title: 'ADD ITEM', headerTitleStyle: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary } as any }}
    />
    <PantryStack.Screen
      name="ItemDetail"
      component={ItemDetailScreen}
      options={{ title: '' }}
    />
  </PantryStack.Navigator>
);

const RecipeNavigator = () => (
  <RecipeStack.Navigator screenOptions={screenOptions}>
    <RecipeStack.Screen
      name="RecipeList"
      component={RecipesScreen}
      options={{ title: 'RECIPES', headerTitleStyle: { fontSize: 12, fontWeight: '500', color: Colors.textPrimary } as any }}
    />
    <RecipeStack.Screen
      name="RecipeDetail"
      component={RecipeDetailScreen}
      options={{ title: '' }}
    />
  </RecipeStack.Navigator>
);

const TabIcon = ({
  icon,
  focused,
}: {
  icon: string;
  focused: boolean;
}) => (
  <Text style={{ fontSize: focused ? 18 : 16, color: focused ? Colors.gold : Colors.textMuted }}>
    {icon}
  </Text>
);

export const AppNavigator = () => {
  const { logout } = useAuthStore();

  return (
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
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'HOME',
          tabBarIcon: ({ focused }) => <TabIcon icon="⌂" focused={focused} />,
          headerTitle: () => (
            <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 6, color: Colors.gold }}>
              ✦ SMART PANTRY
            </Text>
          ),
          headerRight: () => (
            <Text
              style={{ color: Colors.textSecondary, marginRight: 16, fontSize: 11, letterSpacing: 1 }}
              onPress={logout}
            >
              SIGN OUT
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Pantry"
        component={PantryNavigator}
        options={{
          title: 'PANTRY',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon="◫" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipeNavigator}
        options={{
          title: 'RECIPES',
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon icon="✦" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Costs"
        component={CostDashboardScreen}
        options={{
          title: 'COSTS',
          tabBarIcon: ({ focused }) => <TabIcon icon="◎" focused={focused} />,
          headerTitle: () => (
            <Text style={{ ...Typography.overline, fontSize: 12, letterSpacing: 4, color: Colors.textPrimary }}>
              ANALYTICS
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};
