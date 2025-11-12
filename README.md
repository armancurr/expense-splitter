# Expense Splitter

A modern web application for splitting expenses among groups of people. Track shared purchases, calculate individual balances, and simplify debt settlements with an intuitive interface.

## Overview

Expense Splitter helps groups manage shared expenses effortlessly. Add people to your group, log expenses with flexible splitting options (equal or custom amounts), and automatically calculate who owes whom. The application uses a smart debt simplification algorithm to suggest the minimum number of transactions needed to settle all balances.

## Features

- **People Management**: Add and remove people from your expense group
- **Expense Tracking**: Record expenses with description, amount, date, and payer
- **Flexible Splitting**: Choose between equal splits or custom amounts per person
- **Balance Calculation**: Real-time calculation of individual balances (paid, owes, net)
- **Debt Simplification**: Automatic calculation of minimum transactions to settle all debts
- **Data Persistence**: All data automatically saved to browser localStorage
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Technology Stack

- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework

## Installation

1. Clone the repository or navigate to the project directory:

```bash
cd expense-splitter
```

2. Install dependencies:

```bash
npm install
```

This will install all required packages listed in `package.json`.

## Running the Application

### Development Mode

Start the development server:

```bash
npm run dev
```

## Usage Guide

### Getting Started

1. **Add People**: Start by adding people to your expense group using the "Manage People" section. You need at least 2 people to create expenses.

2. **Add Expenses**: 
   - Fill in the expense details (description, amount, date)
   - Select who paid for the expense
   - Choose split type:
     - **Equal Split**: Amount divided equally among selected people
     - **Custom Amounts**: Specify exact amount for each person
   - Select which people should share the expense
   - Click "Add Expense"

3. **View Balances**: Check the "Balances" section to see:
   - Total group spending
   - Individual balances (who paid what, who owes what)
   - Suggested settlements (minimum transactions to settle all debts)

4. **Manage Expenses**: View and delete expenses from the "Expense History" section. Click on any expense to see detailed split information.

### Example Scenarios

**Equal Split Example:**
- Expense: "Dinner" - $60
- Paid by: Alice
- Split equally between: Alice, Bob, Charlie
- Result: Each person owes $20

**Custom Split Example:**
- Expense: "Groceries" - $100
- Paid by: Bob
- Custom amounts: Alice $40, Bob $35, Charlie $25
- Result: Each person owes their specified amount

## Project Structure

```
expense-splitter-challenge/
├── src/
│   ├── components/          # React components
│   │   ├── balance-view.tsx
│   │   ├── expense-form.tsx
│   │   ├── expense-list.tsx
│   │   └── people-manager.tsx
│   ├── hooks/               # Custom React hooks
│   │   └── use-local-storage.ts
│   ├── utils/               # Utility functions
│   ├── types.ts             # TypeScript type definitions
│   ├── App.tsx              # Main application component
│   ├── main.tsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                    # Production build output
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.js           # Vite configuration
└── tailwind.config.js       # Tailwind CSS configuration
```

## Data Persistence

All data (people and expenses) is automatically saved to the browser's localStorage. This means:

- Data persists across browser sessions
- Data survives page refreshes
- Data is stored locally on your device
- Data is not synced across different devices or browsers

To start fresh, manually remove all people and expenses, or clear your browser's localStorage for this site.