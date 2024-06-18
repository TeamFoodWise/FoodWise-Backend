import supabase from '../config/supabase';
import { Consumption } from '../utils/interface';

class ConsumptionModel {
    static async create(consumption: {
        date: string;
        quantity: any;
        user_id: number;
        item_id: number | undefined
    }): Promise<Consumption | null> {
        const { data, error } = await supabase
            .from('consumptions')
            .insert(consumption)
            .select()
            .single();

        if (error) {
            console.error('Error creating consumption:', error.message);
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<Consumption[]> {
        const { data, error } = await supabase
            .from('consumptions')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number): Promise<Consumption | null> {
        const { data, error } = await supabase
            .from('consumptions')
            .select('*')
            .eq('id', id)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number, consumption: Consumption): Promise<Consumption | null> {
        const { data, error } = await supabase
            .from('consumptions')
            .update(consumption)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<void> {
        const {error} = await supabase
            .from('consumptions')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }

    static async getConsumptionsByUserId(userId: number): Promise<Consumption[]> {
        const { data, error } = await supabase
            .from('consumptions')
            .select('*')
            .eq('user_id', userId);

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }
}

export default ConsumptionModel;
