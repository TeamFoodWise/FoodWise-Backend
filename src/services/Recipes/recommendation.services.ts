import {Response} from 'express';
import {AuthenticatedRequest, Item} from "../../utils/interface";
import axios from 'axios';
import ItemModel from "../../models/item.model";

export const getRecipesData = async (targetUrl: string, ingredients: Item[]) => {
    const ingredientNames = ingredients.map(ingredient => ingredient.name);
    const data = {
        "ingredients": ingredientNames
    }
    const response = await axios.post(targetUrl, data);
    return response.data;
}

export const getRecommendation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const page = parseInt(<string>req.query.page) || 1;
    const limit = parseInt(<string>req.query.limit) || 10;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    try {
        const userId = req.userId;
        if (!userId) {
            res.status(400).json({error: 'User not found'});
        }
        const targetUrl = 'https://fastapi-service-dot-foodwise-423308.as.r.appspot.com/recipes'

        const ingredients = await ItemModel.findByUserId(userId);
        const response = await getRecipesData(targetUrl, ingredients);

        const recipes = response.data.map((recipe: any) => {
            return {
                id: recipe.id,
                name: recipe.name,
                ingredients: recipe.ingredients,
            }
        }).slice(startIndex, endIndex)

        res.status(200).json({
            recipes
        })

    } catch (error: any) {
        res.status(500).json({error: error.message});
    }
}