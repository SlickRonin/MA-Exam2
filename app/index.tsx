// app/index.js
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { getRecipes, initDatabase } from './database/db';

export default function HomeScreen() {
  initDatabase() // This is important to show that the database is initalized before the tables are called.
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // useEffect - This useEffect is designed to load recipe data when the component first mounts.
  useEffect(() => {
    loadRecipes();
  }, []); // The empty array as the second argument means this effect will only run once after the initial render of the component

  //Synchronous operations block execution until they complete
  //API calls, file operations, and database queries take unpredictable amounts of time
  // that's why we use async. We need to use try catch because it is outside the scope of the system
  const loadRecipes = async () => {
    try {
      setLoading(true); // Similar to a session variable
      const recipesData = await getRecipes(); //makes an asynchronous call to get recipe data.
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    if (text) {
      const filtered = recipes.filter(
        recipe => 
          recipe.name.toLowerCase().includes(text.toLowerCase()) ||
          recipe.cuisine_type.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    } else {
      setFilteredRecipes(recipes);
    }
  };

  const navigateToRecipeDetail = (id) => {
    router.push(`/recipe/details/${id}`);
  };

  const navigateToAddRecipe = () => {
    router.push('/recipe/add');
  };

  const renderRecipeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigateToRecipeDetail(item.id)}
    >
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <Text style={styles.recipeDetails}>
          {item.cuisine_type ? `${item.cuisine_type} • ` : ''}
          {item.cooking_time ? `${item.cooking_time} mins` : 'No time specified'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchTerm}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" style={styles.loader} />
      ) : (
        <>
          {filteredRecipes.length > 0 ? (
            <FlatList
              data={filteredRecipes}
              renderItem={renderRecipeItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.recipeList}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchTerm
                  ? "No recipes match your search"
                  : "No recipes yet. Add your first recipe!"}
              </Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={navigateToAddRecipe}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  loader: {
    marginTop: 20,
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recipeDetails: {
    color: '#757575',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonText: {
    fontSize: 32,
    color: 'white',
    marginTop: -4,
  },
});