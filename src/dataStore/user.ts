/***  
 * user data store
 * */

export enum Role {
    Admin, User,
}

export type UserType = {
    userid: number;
    name: string;
    location: string;
    role: Role
}
export const users: UserType[] = [
    { userid: 1, name: "Amit Sharma", location: "Delhi, India", role: Role.Admin },
    { userid: 2, name: "Sophia Williams", location: "New York, USA", role: Role.User },
    { userid: 3, name: "Raj Patel", location: "Mumbai, India", role: Role.User },
    { userid: 4, name: "Emily Johnson", location: "London, UK", role: Role.Admin },
]