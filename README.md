# Project Title

This project follows a specific folder structure to maintain organization and scalability. The structure is inspired by best practices in React development.

## Folder Structure Reference

For detailed insights into the folder structure, please refer to the following article:

[Frontend Folder Structure Reference](https://dev.to/itswillt/folder-structures-in-react-projects-3dp8)

## Project Structure

└── src/
    ├── assets/
    ├── modules/
    |   ├── core/
    │   │   ├── components/
    │   │   ├── design-system/
    │   │   │   └── Button.tsx
    │   │   ├── hooks/
    │   │   ├── lib/
    │   │   └── utils/
    │   ├── payment/
    │   │   ├── components/
    │   │   │   └── PaymentForm.tsx
    │   │   ├── hooks/
    │   │   │   └── usePayment.ts
    │   │   ├── lib/
    │   │   ├── services/
    │   │   ├── states/
    │   │   └── utils/
    │   ├── auth/
    │   │   ├── components/
    │   │   │   └── SignUpForm.tsx
    │   │   ├── hooks/
    │   │   │   └── useAuth.ts
    │   │   ├── lib/
    │   │   ├── services/
    │   │   ├── states/
    │   │   └── utils/
    │   └── employees/
    │       ├── components/
    │       │   ├── EmployeeList.tsx
    │       │   └── EmployeeSummary.tsx
    │       ├── hooks/
    │       │   ├── useEmployees.ts
    │       │   └── useUpdateEmployee.ts
    │       ├── services/
    │       ├── states/
    │       └── utils/
    └── ...


## UI Components
- **components**: React components - the main UI building blocks.
- **design-system**: Fundamental UI elements and patterns based on the design system.
- **icons**: SVG icons that are meant to be used inline.

## React Specific
- **hooks**: Custom React hooks for shared logic.
- **hocs**: React Higher-order Components.
- **contexts/providers**: Contains React Contexts and Providers.

## Utilities & External Integrations
- **utils**: Utilities for universal logic that is not related to business logic or any technologies, e.g., string manipulations, mathematical calculations, etc.
- **lib**: Utilities that are related to certain technologies, e.g., DOM manipulations, HTML-related logic, localStorage, IndexedDB, etc.
- **plugins**: Third-party plugins (e.g., i18n, Sentry, etc.).

## Business Logic
- **services**: Encapsulates main business & application logic.
- **helpers**: Provides business-specific utilities.

## Styles
- **styles**: Contains (global) CSS or CSS-in-JS styles.

## TypeScript and Configurations
- **types**: For general TypeScript types, enums, and interfaces.
- **configs**: Configurations for the application (e.g., environment variables).
- **constants**: Constant, unchanged values (e.g., `export const MINUTES_PER_HOUR = 60`).

## Server Communication
- **api**: For logic that communicates with the server(s).
- **graphql**: GraphQL-specific code.

## State Management
- **states/store**: Global state management logic (Zustand, Valtio, Jotai, etc.).
- **reducers, store, actions, selectors**: Redux-specific logic.

## Routing
- **routes/router**: Defining routes (if you're using React Router or the like).
- **pages**: Defining entry-point components for pages.

## Testing
- **tests**: Unit tests and other kinds of tests for your code.