export interface User {
    id?: number;
    name: string;
    email: string;
    hashed_password: string;
    preferences?: object;
}

export interface Inventory {
    id?: number;
    name: string;
    user_id: number;
}



