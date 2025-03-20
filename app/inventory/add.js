import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { saveItem } from '../database/db';

export default function AddItemScreen() {
  const [item, setItem] = useState({
    name: '',
    category: '',
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleItemChange = (key, value) => {
    setItem(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveItem = async () => {
    // Validate form: Item name is required
    if (!item.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    try {
      setLoading(true);
      await saveItem(item);
      Alert.alert('Success', 'Item saved successfully', [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } catch (error) {
      console.error('Error saving item:', error);
      Alert.alert('Error', 'Failed to save item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Item Information</Text>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={item.name}
              onChangeText={(value) => handleItemChange('name', value)}
              placeholder="Enter item name or description"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={item.category}
              onChangeText={(value) => handleItemChange('category', value)}
              placeholder="E.g., Electronics, Furniture"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Purchase Date</Text>
            <TextInput
              style={styles.input}
              value={item.purchase_date}
              onChangeText={(value) => handleItemChange('purchase_date', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Warranty Expiry</Text>
            <TextInput
              style={styles.input}
              value={item.warranty_expiry}
              onChangeText={(value) => handleItemChange('warranty_expiry', value)}
              placeholder="YYYY-MM-DD"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={item.location}
              onChangeText={(value) => handleItemChange('location', value)}
              placeholder="Where is the item located?"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={item.notes}
              onChangeText={(value) => handleItemChange('notes', value)}
              placeholder="Any additional details about the item"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
        
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSaveItem}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Saving...' : 'Save Item'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  scrollView: {
    flex: 1,
  },
  formSection: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  formField: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 80,
  },
  submitButtonContainer: {
    margin: 16,
  },
  submitButton: {
    backgroundColor: '#4dabf7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
