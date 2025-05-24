// Define a PermissionGroup type
export type PermissionGroup = {
    name: string;
    permissions: Permission[];
}

// Define a Resource type for reusable components across modules
export type Resource = {
    key: string;
    value: string;
    description: string;
}

// Define a Permission type
export type Permission = {
    name: string;
    resources: Resource[];
}

