import { Friend } from "./friend";

export type Group = {
    group_id: number;
    group_title: string;
    users: Friend[];
};
