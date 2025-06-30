import { BaseEvent } from "../types/events";

const PARENT_URL = import.meta.env.VITE_PARENT_URL || '*';

export function postMessage(method: BaseEvent['method'], type: BaseEvent['type'], data?: unknown) {
    window.parent.postMessage(
        {
            method,
            type,
            data
        },
        PARENT_URL,
    );
}