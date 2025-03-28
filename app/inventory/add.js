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
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [warrantyPeriod, setWarrantyPeriod] = useState(''); // in years
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // States to control the date pickers
  const [showPurchasePicker, setShowPurchasePicker] = useState(false);

  // Helper to format dates as YYYY-MM-DD
  const formatDate = (date) => date.toISOString().split('T')[0];

  // Helper to add years to a date
  const addYears = (date, years) => {
    const newDate = new Date(date);
    newDate.setFullYear(newDate.getFullYear() + years);
    return newDate;
  };

  // Update the warranty expiry date automatically when purchase_date or warrantyPeriod changes
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

  const handleItemChange = (key, value) => {
    setItem(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveItem = async () => {
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
                    handleItemChange('purchase_date', formatDate(selectedDate));
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
              onChangeText={(value) => handleItemChange('warranty_expiry', value)}
              placeholder="Auto-calculated or select manually"
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
