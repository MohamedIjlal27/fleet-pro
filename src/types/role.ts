export type Role = {
    id: number;
    slug: string;
    name: string;
    description: string;
    isActive: boolean;
    isCustom: boolean;
    organization: string | null;
};