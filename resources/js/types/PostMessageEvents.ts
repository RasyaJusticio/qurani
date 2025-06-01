export type GenericEvent = {
    data: unknown;
    type: "parent_state";
};

export type ParentStateEvent = GenericEvent & {
    data: {
        c_user: string;
        s_lang: string;
        s_night_mode: string;
        user_session: string;
        signature: string;
    };
    type: "parent_state"
}
