import {Response} from 'express';
import {AuthenticatedRequest, Recipe} from "../../utils/interface";
import ItemModel from "../../models/item.model";
import {getRecipesData} from "./recommendation.services";

export const getRecommendationDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const id = parseInt(<string>req.params.id);
    if (!userId) {
        res.status(400).json({error: 'User not found'});
    }

    const targetUrl = 'https://fastapi-service-dot-foodwise-423308.as.r.appspot.com/recipes'
    const ingredients = await ItemModel.findByUserId(userId);
    const response = await getRecipesData(targetUrl, ingredients);

    const recipe = response.data.find((recipe: Recipe) => recipe.index === id);
    console.log(recipe)
    if (!recipe) {
        res.status(404).json({error: 'Recipe not found'});
    }

    res.status(200).json({
        name: recipe.name,
        ingredients: recipe.ingredients,
        steps: recipe.steps
    });

}