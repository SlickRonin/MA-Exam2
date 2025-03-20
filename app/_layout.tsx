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
          title: 'Home Inventory',
        }}
      />
      <Stack.Screen
        name="inventory/details/[id]"
        options={{
          title: 'Item Details',
        }}
      />
      <Stack.Screen
        name="inventory/add"
        options={{
          title: 'Add New Item',
        }}
      />
      <Stack.Screen
        name="inventory/edit/[id]"
        options={{
          title: 'Edit Item',
        }}
      />
    </Stack>
  );
}
