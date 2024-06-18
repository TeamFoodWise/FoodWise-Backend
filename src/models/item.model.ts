import supabase from '../config/supabase';
import {Item} from '../utils/interface';
import InventoryModel from "./inventory.model";

class ItemModel {
    static async create(item: Item): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .insert(item)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findAll(): Promise<Item[]> {
        const {data, error} = await supabase
            .from('items')
            .select('*');

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findById(id: number | undefined): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async update(id: number | undefined, item: Item): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .update(item)
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async delete(id: number): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .delete()
            .eq('id', id)
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    static async findByInventoryId(inventoryId: number | undefined): Promise<Item[]> {
        const {data, error} = await supabase
            .from('items')
            .select('*')
            .eq('inventory_id', inventoryId);

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findByUserId(userId: number | undefined): Promise<Item[]> {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const inventories = await InventoryModel.findByUserId(userId);

        const inventoryIdList = inventories.map((inventory) => inventory.id);

        const {data, error} = await supabase
            .from('items')
            .select('*')
            .in('inventory_id', inventoryIdList);

        if (error) {
            throw new Error(error.message);
        }

        return data || [];
    }

    static async findByNameAndExpirationDateAndInventory(productName: string, expiration_date: string, inventory_id: number | undefined): Promise<Item | null> {
        const {data, error} = await supabase
            .from('items')
            .select('*')
            .eq('name', productName)
            .eq('expiration_date', expiration_date)
            .eq('inventory_id', inventory_id);

        if (error) {
            throw new Error(error.message);
        }

        if (!data || data.length === 0) {
            return null;
        } else if (data.length > 1) {
            throw new Error('Multiple items found with the same name and expiration date');
        }

        return data[0];
    }

    static async isItemUsers(itemId: number, userId: number): Promise<boolean> {
        const item = await this.findById(itemId);
        return item?.inventory_id === userId;
    }
}

export default ItemModel;
