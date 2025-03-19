// app/_layout.js
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { initDatabase } from './database/db';

export default function Layout() {
  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };

    setupDatabase();
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Recipe Planner',
        }}
      />
      <Stack.Screen
        name="recipe/details/[id]"
        options={{
          title: 'Recipe Details',
        }}
      />
      <Stack.Screen
        name="recipe/add"
        options={{
          title: 'Add New Recipe',
          // presentation: 'modal', // if you want to make the presentation a modal instead of a stack
        }}
      />
      <Stack.Screen
        name="recipe/edit/[id]"
        options={{
          title: 'Edit Recipe',
        }}
      />
    </Stack>
  );
}