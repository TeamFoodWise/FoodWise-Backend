import {Request} from 'express';

export interface User {
    id?: number;
    full_name: string;
    email: string;
    hashed_password: string;
    preferences?: object;
    last_month_progress?: number;
    profile_url?: string;
}

export interface Inventory {
    id?: number;
    name: string;
    user_id: number;
}

export interface Item {
    id?: number;
    name: string;
    quantity: number;
    unit: string;
    measure: string;
    purchase_date?: string;
    expiration_date: string;
    inventory_id: number;
}

export interface History {
    id?: number;
    user_id: number;
    item_id: number;
    consumption_id?: number;
    event: string;
    date: string;
    quantity: number;
}

export interface Consumption {
    id?: number;
    user_id: number;
    item_id: number;
    date: string;
    quantity: number;
}

export interface JwtPayload {
    userId: string;
}

export interface AuthenticatedRequest extends Request {
    userId?: number;
    access_token?: string;
    refresh_token?: string;
}

export interface Recipe {
    index: number;
    name: string;
    ingredients: string[];
    steps: string[];
    minutes: number;
    description: string;
    rating: number;
}

