export interface User {
    id?: number;
    name: string;
    email: string;
    hashed_password: string;
    preferences?: object;
}



