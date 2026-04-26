import pandas as pd

# Load dataset (once, globally)
df = pd.read_csv("dataset/pred_food.csv")

# Clean column names (important!)
df.columns = df.columns.str.strip()

# Create a lookup dictionary {ingredient: nutrient info}
ingredient_lookup = {}
for _, row in df.iterrows():
    name = row["Food Name"].strip().lower()
    ingredient_lookup[name] = {
        "Glycemic Index": row.get("Glycemic Index", 0),
        "Carbohydrates": row.get("Carbohydrates", 0),
        "Protein": row.get("Protein", 0),
        "Fat": row.get("Fat", 0),
        "Fiber Content": row.get("Fiber Content", 0),
    }

# Main function: takes list of ingredients → returns average feature vector
def preprocess_ingredients(ingredients):
    gi_list = []
    carbs_list = []
    protein_list = []
    fat_list = []
    fiber_list = []

    for ing in ingredients:
        ing = ing.strip().lower()
        if ing in ingredient_lookup:
            data = ingredient_lookup[ing]
            gi_list.append(data["Glycemic Index"])
            carbs_list.append(data["Carbohydrates"])
            protein_list.append(data["Protein"])
            fat_list.append(data["Fat"])
            fiber_list.append(data["Fiber Content"])
        else:
            print(f"Warning: '{ing}' not found in dataset. Skipping.")

    # Avoid division by zero
    count = len(gi_list)
    if count == 0:
        return [0, 0, 0, 0, 0]

    return [
        sum(gi_list) / count,
        sum(carbs_list) / count,
        sum(protein_list) / count,
        sum(fat_list) / count,
        sum(fiber_list) / count,
    ]

# Example test (run this to try)
if __name__ == "__main__":
    test_input = ["banana", "ghee", "dal"]
    vector = preprocess_ingredients(test_input)
    print("Feature vector for model:", vector)
