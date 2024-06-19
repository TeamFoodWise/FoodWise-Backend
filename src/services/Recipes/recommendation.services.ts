import {Response} from 'express';
import {AuthenticatedRequest, Item, Recipe} from "../../utils/interface";
import axios from 'axios';
import ItemModel from "../../models/item.model";
import showInStockIngredients from "../../utils/showInStockItems";

export const getRecipesData = async (targetUrl: string, ingredients: Item[]): Promise<any> => {
    const ingredientNames = ingredients.map(ingredient => ingredient.name.toLowerCase());
    const dataIngredients = {
        ingredients: ingredientNames
    }

    try {
        const response = await axios.post(targetUrl, dataIngredients);
        if (response.status !== 200) {
            throw new Error('Failed to get recipes data');
        }
        return response.data;
    } catch (error: any) {
        console.error('Error fetching recipes data:', error.response ? error.response.data : error.message);
        throw error;
    }
}

export const getRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'User not found'});
            return;
        }
        const targetUrl = 'https://fastapi-service-dot-foodwise-423308.as.r.appspot.com/recipes'

        const ingredients = await ItemModel.findByUserId(userId);
        const inStockIngredients = await showInStockIngredients(ingredients, userId);
        console.log(inStockIngredients)

        if (inStockIngredients.length === 0) {
            res.status(200).json({
                recipes: []
            });
            return;
        }

        const response = await getRecipesData(targetUrl, inStockIngredients);

        const recipes = response.data.map((recipe: Recipe) => {
            return {
                id: recipe.index,
                name: recipe.name,
                ingredients: recipe.ingredients,
            }
        })
            .filter((recipe: Recipe) => recipe.index !== 4969);

        res.status(200).json({
            recipes
        })

    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}