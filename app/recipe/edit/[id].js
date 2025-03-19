// app/recipe/edit/[id].js
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getRecipeById, updateRecipe } from '../../database/db';

export default function EditRecipeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [recipe, setRecipe] = useState({
    id: parseInt(id),
    name: '',
    description: '',
    cuisine_type: '',
    cooking_time: '',
    image_uri: '',
  });
  const [ingredients, setIngredients] = useState([{ item: '', quantity: '', unit: '' }]);
  const [steps, setSteps] = useState([{ step_number: 1, instruction: '' }]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadRecipe();
  }, [id]);

  const loadRecipe = async () => {
    try {
      setInitialLoading(true);
      const recipeData = await getRecipeById(parseInt(id));
      
      if (recipeData) {
        setRecipe({
          ...recipeData,
          cooking_time: recipeData.cooking_time ? recipeData.cooking_time.toString() : '',
        });
        
        if (recipeData.ingredients && recipeData.ingredients.length > 0) {
          setIngredients(recipeData.ingredients);
        }
        
        if (recipeData.steps && recipeData.steps.length > 0) {
          setSteps(recipeData.steps);
        }
      } else {
        Alert.alert('Error', 'Recipe not found');
        router.back();
      }
    } catch (error) {
      console.error('Error loading recipe:', error);
      Alert.alert('Error', 'Failed to load recipe details');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleRecipeChange = (key, value) => {
    setRecipe(prev => ({ ...prev, [key]: value }));
  };

  const handleIngredientChange = (index, key, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][key] = value;
    setIngredients(updatedIngredients);
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index].instruction = value;
    setSteps(updatedSteps);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { item: '', quantity: '', unit: '' }]);
  };

  const removeIngredient = (index) => {
    if (ingredients.length > 1) {
      const updatedIngredients = [...ingredients];
      updatedIngredients.splice(index, 1);
      setIngredients(updatedIngredients);
    }
  };

  const addStep = () => {
    const nextStepNumber = steps.length > 0 ? steps[steps.length - 1].step_number + 1 : 1;
    setSteps([...steps, { step_number: nextStepNumber, instruction: '' }]);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = [...steps];
      updatedSteps.splice(index, 1);
      
      // Renumber steps
      updatedSteps.forEach((step, idx) => {
        step.step_number = idx + 1;
      });
      
      setSteps(updatedSteps);
    }
  };

  const handleUpdateRecipe = async () => {
    // Validate form
    if (!recipe.name.trim()) {
      Alert.alert('Error', 'Recipe name is required');
      return;
    }

    // Validate ingredients
    const validIngredients = ingredients.filter(ing => ing.item.trim());
    if (validIngredients.length === 0) {
      Alert.alert('Error', 'Add at least one ingredient');
      return;
    }

    // Validate steps
    const validSteps = steps.filter(step => step.instruction.trim());
    if (validSteps.length === 0) {
      Alert.alert('Error', 'Add at least one instruction step');
      return;
    }

    try {
      setLoading(true);
      
      // Convert cooking time to number if provided
      const recipeToUpdate = {
        ...recipe,
        cooking_time: recipe.cooking_time ? parseInt(recipe.cooking_time, 10) : 0
      };
      
      await updateRecipe(recipeToUpdate, validIngredients, validSteps);
      Alert.alert('Success', 'Recipe updated successfully', [
        { text: 'OK', onPress: () => router.replace(`/recipe/${id}`) }
      ]);
    } catch (error) {
      console.error('Error updating recipe:', error);
      Alert.alert('Error', 'Failed to update recipe');
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
          <Text style={styles.sectionTitle}>Recipe Information</Text>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Recipe Name *</Text>
            <TextInput
              style={styles.input}
              value={recipe.name}
              onChangeText={(value) => handleRecipeChange('name', value)}
              placeholder="Enter recipe name"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={recipe.description}
              onChangeText={(value) => handleRecipeChange('description', value)}
              placeholder="Enter recipe description"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Cuisine Type</Text>
            <TextInput
              style={styles.input}
              value={recipe.cuisine_type}
              onChangeText={(value) => handleRecipeChange('cuisine_type', value)}
              placeholder="E.g., Italian, Mexican, etc."
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Cooking Time (minutes)</Text>
            <TextInput
              style={styles.input}
              value={recipe.cooking_time}
              onChangeText={(value) => handleRecipeChange('cooking_time', value)}
              placeholder="E.g., 30"
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.formField}>
            <Text style={styles.label}>Image URL (optional)</Text>
            <TextInput
              style={styles.input}
              value={recipe.image_uri}
              onChangeText={(value) => handleRecipeChange('image_uri', value)}
              placeholder="Enter image URL"
            />
          </View>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientContainer}>
              <View style={styles.formFieldRow}>
                <View style={styles.ingredientName}>
                  <Text style={styles.label}>Ingredient *</Text>
                  <TextInput
                    style={styles.input}
                    value={ingredient.item}
                    onChangeText={(value) => handleIngredientChange(index, 'item', value)}
                    placeholder="E.g., Flour"
                  />
                </View>
                <View style={styles.ingredientQuantity}>
                  <Text style={styles.label}>Qty</Text>
                  <TextInput
                    style={styles.input}
                    value={ingredient.quantity}
                    onChangeText={(value) => handleIngredientChange(index, 'quantity', value)}
                    placeholder="E.g., 2"
                  />
                </View>
                <View style={styles.ingredientUnit}>
                  <Text style={styles.label}>Unit</Text>
                  <TextInput
                    style={styles.input}
                    value={ingredient.unit}
                    onChangeText={(value) => handleIngredientChange(index, 'unit', value)}
                    placeholder="E.g., cups"
                  />
                </View>
              </View>
              {ingredients.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeIngredient(index)}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={addIngredient}
          >
            <Text style={styles.addButtonText}>+ Add Ingredient</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepContainer}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>{step.step_number}</Text>
              </View>
              <View style={styles.stepInstructionContainer}>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={step.instruction}
                  onChangeText={(value) => handleStepChange(index, value)}
                  placeholder="Enter instruction step"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {steps.length > 1 && (
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeStep(index)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addButton}
            onPress={addStep}
          >
            <Text style={styles.addButtonText}>+ Add Step</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleUpdateRecipe}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? 'Updating...' : 'Update Recipe'}
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
  formFieldRow: {
    flexDirection: 'row',
    marginBottom: 8,
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
  ingredientContainer: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  ingredientName: {
    flex: 3,
    marginRight: 8,
  },
  ingredientQuantity: {
    flex: 1,
    marginRight: 8,
  },
  ingredientUnit: {
    flex: 1,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
  },
  stepNumberContainer: {
    marginRight: 16,
    marginTop: 30,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ff6b6b',
    color: 'white',
    textAlign: 'center',
    lineHeight: 30,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepInstructionContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  removeButton: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  removeButtonText: {
    color: '#ff6b6b',
    fontWeight: 'bold',
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