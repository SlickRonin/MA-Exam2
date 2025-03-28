import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getItemById, updateItem } from '../../database/db';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [item, setItem] = useState({
    id: parseInt(id),
    name: '',
    category: '',
    purchase_date: '',
    warranty_expiry: '',
    location: '',
    notes: ''
  });
  
  const [warrantyPeriod, setWarrantyPeriod] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);

  // Helper to format dates as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Helper to add years to a date
  const addYears = (date, years) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  };

  // Load item data on mount
  useEffect(() => {
    loadItem();
  }, [id]);

  const loadItem = async () => {
    try {
      setInitialLoading(true);
      const itemData = await getItemById(parseInt(id));
      
      if (itemData) {
        setItem(itemData);
        // Optionally, set warrantyPeriod if you want to pre-fill it.
        // For example, if warranty_expiry and purchase_date exist, you could compute:
        // warrantyPeriod = difference in years between warranty_expiry and purchase_date.
      } else {
        Alert.alert('Error', 'Item not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading item:', error);
      Alert.alert('Error', 'Failed to load item details');
    } finally {
      setInitialLoading(false);
    }
  };

  // Auto-calculate warranty expiry when purchase_date or warrantyPeriod changes
  useEffect(() => {
    if (item.purchase_date && warrantyPeriod) {
      const purchaseDate = new Date(item.purchase_date);
      const years = parseInt(warrantyPeriod, 10);
      if (!isNaN(years)) {
        const expiryDate = addYears(purchaseDate, years);
        setItem(prev => ({ ...prev, warranty_expiry: formatDate(expiryDate) }));
      }
    }
  }, [item.purchase_date, warrantyPeriod]);

  const handleChange = (key, value) => {
    setItem(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateItem = async () => {
    if (!item.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }
    try {
      setLoading(true);
      await updateItem(item);
      Alert.alert('Success', 'Item updated successfully', [
        { text: 'OK', onPress: () => router.replace(`/item/${id}`) }
      ]);
    } catch (error) {
      console.error('Error updating item:', error);
      Alert.alert('Error', 'Failed to update item');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Enter item name or description"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              value={item.category}
              onChangeText={(value) => handleChange('category', value)}
              placeholder="E.g., Electronics, Furniture"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Purchase Date</Text>
            <TouchableOpacity
              onPress={() => setShowPurchasePicker(true)}
              style={styles.dateInput}
            >
              <Text style={item.purchase_date ? styles.dateText : styles.placeholderText}>
                {item.purchase_date || 'Select Purchase Date'}
              </Text>
            </TouchableOpacity>
            {showPurchasePicker && (
              <DateTimePicker
                value={item.purchase_date ? new Date(item.purchase_date) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPurchasePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    handleChange('purchase_date', formatDate(selectedDate));
                  }
                }}
              />
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Warranty Period (years)</Text>
            <TextInput
              style={styles.input}
              value={warrantyPeriod}
              onChangeText={(value) => setWarrantyPeriod(value)}
              placeholder="E.g., 3"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Warranty Expiry</Text>
            <TextInput
              style={styles.input}
              value={item.warranty_expiry}
              onChangeText={(value) => handleChange('warranty_expiry', value)}
              placeholder="Auto-calculated or select manually"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={item.location}
              onChangeText={(value) => handleChange('location', value)}
              placeholder="Where is this item located?"
            />
          </View>

          <View style={styles.formField}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={item.notes}
              onChangeText={(value) => handleChange('notes', value)}
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
            onPress={handleUpdateItem}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Update Item'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#000'
  },
  placeholderText: {
    fontSize: 16,
    color: '#999'
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
