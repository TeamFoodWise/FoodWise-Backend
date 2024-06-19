import {Response} from 'express';
import {AuthenticatedRequest, Recipe} from "../../utils/interface";
import ItemModel from "../../models/item.model";
import {getRecipesData} from "./recommendation.services";
import showInStockIngredients from "../../utils/showInStockItems";

export const getRecommendationDetail = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId;
    const id = parseInt(<string>req.params.id);
    if (!userId) {
        res.status(400).json({error: 'User not found'});
        return;
    }

    const targetUrl: string = 'https://fastapi-service-dot-foodwise-423308.as.r.appspot.com/recipes'
    let ingredients = await ItemModel.findByUserId(userId);
    let inStockIngredients = await showInStockIngredients(ingredients, userId);

    const response = await getRecipesData(targetUrl, inStockIngredients);

    for (let data of response.data) {
        if (data.index === id) {
            const recipe = data;
            const steps = recipe.steps.map((step: string) => step.charAt(0).toUpperCase() + step.slice(1));

            res.status(200).json({
                name: recipe.name,
                ingredients: recipe.ingredients,
                steps: steps
            });
            return;
        }
    }

    res.status(404).json({error: 'Recipe not found'});
}