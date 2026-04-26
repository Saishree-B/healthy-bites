import pandas as pd
import numpy as np
import re
import os

print("Starting USDA data wrangling process...")

# Load the necessary files from the SR Legacy dataset
try:
    foods = pd.read_csv('food.csv')
    nutrients = pd.read_csv('nutrient.csv')
    food_nutrients = pd.read_csv('food_nutrient.csv')
    food_portions = pd.read_csv('food_portion.csv')
except FileNotFoundError as e:
    print(f"Error: Missing a required CSV file: {e}. Please ensure all necessary files are in the 'ml-service' folder.")
    exit()

# --- Part 1: Prepare Nutrient Data (New, Robust Method) ---
print("Preparing nutrient data...")
# Merge food_nutrients with nutrient names
merged_data = pd.merge(food_nutrients, nutrients, left_on='nutrient_id', right_on='id', how='left')

# Drop duplicates based on fdc_id and nutrient name
merged_data = merged_data.drop_duplicates(subset=['fdc_id', 'name'])

# Pivot the table to get nutrients as columns
nutrients_pivot = merged_data.pivot_table(index='fdc_id', columns='name', values='amount', aggfunc='first').reset_index()

# Merge with foods for descriptions
final_df = pd.merge(nutrients_pivot, foods, on='fdc_id', how='left')

# --- Part 2: Merge in quantity data from food_portions ---
print("Merging in quantity data from food_portions...")
# Use the first portion available for each food item
primary_portions = food_portions.sort_values(by=['fdc_id', 'portion_description', 'gram_weight'], ascending=[True, True, True]).drop_duplicates(subset=['fdc_id'], keep='first')
primary_portions = primary_portions[['fdc_id', 'portion_description', 'gram_weight']]

# Merge into our main dataframe
final_df = pd.merge(final_df, primary_portions, on='fdc_id', how='left')

# Rename and clean up columns
final_df.rename(columns={'portion_description': 'Serving_Description', 'gram_weight': 'Quantity'}, inplace=True)

# Generate a more descriptive Serving_Description when the original is missing
def create_serving_description(row):
    if pd.isna(row['Serving_Description']) or row['Serving_Description'] == 'unspecified':
        if not pd.isna(row['Quantity']):
            return f"{row['Quantity']:.0f} g"
        else:
            return 'unspecified'
    else:
        return row['Serving_Description']

final_df['Serving_Description'] = final_df.apply(create_serving_description, axis=1)

# Fill any remaining NaNs in Quantity with 100.0 (for 100g)
final_df['Quantity'] = final_df['Quantity'].fillna(100.0)

# --- Part 3: Finalize and Clean Dataset ---
final_df.rename(columns={'description': 'Food_Description'}, inplace=True)
final_df['Ingredients'] = final_df['Food_Description']

# Clean ingredients text
final_df['Ingredients'] = final_df['Ingredients'].apply(lambda x: re.sub(r'[^a-zA-Z\s,]', '', str(x)).lower().strip())
final_df = final_df[final_df['Ingredients'] != '']

print("Sample of generated Ingredients:", final_df['Ingredients'].head())
print("Sample of Serving Sizes:", final_df['Quantity'].head())
print(f"\nFound {len(final_df)} food items with ingredients.")

# A more robust way to rename columns for consistency
nutrient_rename_dict = {
    'Energy': 'Calories',
    'Total lipid (fat)': 'Fat (g)',
    'Carbohydrate, by difference': 'Carbohydrates (g)',
    'Protein': 'Protein (g)',
    'Fiber, total dietary': 'Fiber (g)',
    'Sugars, total': 'Sugars (g)',
    'Sugars, Total': 'Sugars (g)'
}
final_df.rename(columns=nutrient_rename_dict, inplace=True)

# Reorder columns for clarity and save
required_cols = ['Food_Description', 'Ingredients', 'Quantity', 'Serving_Description', 'Calories', 'Carbohydrates (g)', 'Protein (g)', 'Fat (g)', 'Fiber (g)', 'Sugars (g)']
final_df = final_df.reindex(columns=required_cols)

# Fill numeric columns with 0 where they have missing values
numeric_cols = [col for col in required_cols if col not in ['Food_Description', 'Ingredients', 'Serving_Description']]
final_df[numeric_cols] = final_df[numeric_cols].fillna(0)

output_filename = 'usda_processed_data.csv'
final_df.to_csv(output_filename, index=False)

print(f"\nSuccess! Data processing complete! Your final dataset is saved as '{output_filename}'.")
print("You can now use this file in 'generate_model.py'.")