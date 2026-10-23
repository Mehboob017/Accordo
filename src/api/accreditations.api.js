import { SDL_BASE_URL } from "@/utils/constants";
import { parseJsonOrEmpty } from "./orders.api";

export const fetchAccreditations = async () => {

    const response = await fetch(
        `${SDL_BASE_URL}/accrediation`,
        {
            method: 'GET',
            // cache: 'no-store',
        }
    );

    const data = await parseJsonOrEmpty(response);

    if (!response.ok || data?.success === false) {
        throw new Error(data?.message || 'Failed to fetch accreditations');
    }

    return data;
};
