import { UserContext } from "./user-context.model";

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    imgUrl: string;
    userContext : UserContext;
}
