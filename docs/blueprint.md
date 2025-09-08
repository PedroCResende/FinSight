# **App Name**: FinSight

## Core Features:

- User Authentication: Secure user login and registration using Firebase Auth.
- Category Management: Allow users to create, edit, and delete custom spending categories.
- Transaction Upload: Enable users to upload bank statements in CSV format.  Assume the column order: 'Date', 'Description', 'Value'.
- Smart Categorization Tool: Leverage an LLM to suggest categories for uncategorized transactions, using transaction descriptions as input. The LLM will use reasoning to decide when and if to assign each transaction a category.
- Manual Categorization: Enable manual transaction categorization with a dropdown of available categories.
- Spending Visualization: Generate an interactive pie chart visualizing spending distribution across categories.

## Style Guidelines:

- Primary color: Forest green (#3F72AF) for a sense of financial well-being and stability.
- Background color: Light grey (#F0F4F8), to provide a clean and modern backdrop that does not distract from the data.
- Accent color: Soft orange (#D1623F) for calls to action and highlights, creating visual interest.
- Body and headline font: 'PT Sans' (sans-serif) provides a modern, readable, and clean interface.
- Use clean and minimalist icons from a consistent set (e.g. Material Design Icons) to represent different spending categories.
- Employ a card-based layout to present information clearly and in a modular fashion. Cards should have subtle shadows for depth.
- Subtle transitions and animations when categorizing transactions or updating the chart to provide a smooth user experience.