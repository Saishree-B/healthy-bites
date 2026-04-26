const calculateGoals = (weight, height, age) => {
    // Using Mifflin-St Jeor formula
    const BMR_MALE = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    const BMR_FEMALE = (10 * weight) + (6.25 * height) - (5 * age) - 161;

    // Assuming a moderately active lifestyle for a starting point (1.55)
    // You can let the user specify this in the future
    const TDEE_MALE = BMR_MALE * 1.55;
    const TDEE_FEMALE = BMR_FEMALE * 1.55;

    // Use a placeholder male/female for now
    const dailyCalorieGoal = TDEE_MALE; // Or TDEE_FEMALE based on user input
    const dailyCarbGoal = (dailyCalorieGoal * 0.45) / 4; // 45% of calories from carbs

    return {
        dailyCalorieGoal: dailyCalorieGoal,
        dailyCarbGoal: dailyCarbGoal
    };
};

module.exports = { calculateGoals };