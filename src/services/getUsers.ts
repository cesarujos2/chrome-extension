import { queryTefiDB } from "./TefiDB";

export async function getUsers() {
    const users: IUsers[] =  await queryTefiDB(`
SELECT dgprc.users.user_name, dgprc.users.first_name, dgprc.users.last_name
FROM dgprc.users
WHERE dgprc.users.deleted = 0; AND dgprc.users.employee_status = 'Active'`);

    return users ?? []
}

export interface IUsers {
    user_name: string,
    first_name: string,
    last_name: string
} 