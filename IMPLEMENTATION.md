# Expense Splitter - Implementation Documentation

## Overview

This document explains all the changes made to implement the Expense Splitter application, including the technical approach, reasoning behind decisions, and instructions for using the app.

---

## Table of Contents

1. [Technical Implementation](#technical-implementation)
2. [Feature Breakdown](#feature-breakdown)
3. [How to Use the Application](#how-to-use-the-application)
4. [Technical Decisions & Reasoning](#technical-decisions--reasoning)

---

## Technical Implementation

### 1. Custom Hook for localStorage (`src/hooks/useLocalStorage.ts`)

**What it does:**
- A custom React hook that manages state with automatic localStorage persistence
- Reads initial data from localStorage or uses default values
- Automatically saves to localStorage whenever state changes

**Implementation:**
```typescript
export function useLocalStorage<T>(key: string, initialValue: T)
```

**Why this approach:**
- Simple and reusable - can be used for any type of data
- Automatic synchronization between React state and localStorage
- Handles errors gracefully (e.g., if localStorage is unavailable)
- Type-safe with TypeScript generics

**How it works:**
1. When component mounts, tries to read from localStorage
2. If data exists, parses and uses it; otherwise uses initialValue
3. Returns state and setter function (just like useState)
4. useEffect watches for state changes and saves to localStorage

---

### 2. State Management in App Component (`src/App.tsx`)

**What changed:**
- Added useLocalStorage hook to manage people and expenses
- Created handler functions for all CRUD operations
- Props are passed down to child components
- **Starts with empty arrays** - users begin with a clean slate (no dummy data)

**Key Functions:**

```typescript
// People Management
addPerson(name: string): boolean
removePerson(name: string): void

// Expense Management
addExpense(expense: Omit<Expense, 'id'>): void
deleteExpense(id: number): void
```

**Data Flow:**
```
App (State) → Components (Props) → User Actions → App (State Updates) → localStorage
```

**Why this approach:**
- **Lifting State Up**: All shared state lives in App component
- **Single Source of Truth**: One place manages all data
- **Simple Props Drilling**: Only 2 levels deep, easy to understand
- **Clean Slate**: Users start with empty arrays, no dummy data
- **localStorage Keys**: 
  - `expense-splitter-people` - stores people array
  - `expense-splitter-expenses` - stores expenses array

---

### 3. People Management (`src/components/PeopleManager.tsx`)

**Features Implemented:**

1. **Add Person**
   - Input field with controlled component pattern
   - Validation: prevents empty names and duplicates
   - Success/error feedback messages
   - Form clears after successful addition

2. **Remove Person**
   - Delete button next to each person
   - Immediate removal with feedback

3. **Display**
   - Shows current count of members
   - Warning message when less than 2 people
   - Empty state message

**Key Changes:**
- Added React state for input and messages
- Implemented form submission handler
- Added validation logic
- Added feedback system with auto-dismiss (3 seconds)

**Code Structure:**
```typescript
interface PeopleManagerProps {
  people: string[];
  onAddPerson: (name: string) => boolean;
  onRemovePerson: (name: string) => void;
}
```

---

### 4. Expense Form (`src/components/ExpenseForm.tsx`)

**Features Implemented:**

1. **All Required Fields**
   - Description (text input)
   - Amount (number input with 2 decimal places)
   - Date (date picker, defaults to today)
   - Paid By (dropdown of all people)
   - Split Type (radio buttons: Equal or Custom)
   - Split Between (checkboxes for each person)

2. **Equal Split**
   - User selects which people to split between
   - Amount divided equally among selected people

3. **Custom Split**
   - User selects people and enters custom amount for each
   - Validation ensures custom amounts sum to total amount
   - Shows input fields dynamically when people are selected

4. **Validation**
   - Description cannot be empty
   - Amount must be positive number
   - Must select who paid
   - Must select at least one person to split with
   - Custom amounts must total the expense amount

**State Management:**
```typescript
const [description, setDescription] = useState('');
const [amount, setAmount] = useState('');
const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
const [paidBy, setPaidBy] = useState('');
const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
const [splitBetween, setSplitBetween] = useState<string[]>([]);
const [customAmounts, setCustomAmounts] = useState<{ [person: string]: number }>({});
```

**Why this approach:**
- Controlled components for all inputs (React best practice)
- Local state for form data (doesn't need to be in App)
- Comprehensive validation prevents invalid data
- Form resets after successful submission
- Disabled submit button when fewer than 2 people

---

### 5. Expense List (`src/components/ExpenseList.tsx`)

**Features Implemented:**

1. **Display All Expenses**
   - Shows description, date, payer, and amount
   - Sorted by most recent first
   - Empty state message when no expenses

2. **Expandable Details**
   - Click any expense to expand/collapse
   - Shows split type (Equal or Custom)
   - Lists each person and their share amount
   - Animated arrow indicator

3. **Delete Expense**
   - Delete button in expanded view
   - Confirmation dialog before deletion
   - Prevents accidental deletions

**State Management:**
```typescript
const [expandedId, setExpandedId] = useState<number | null>(null);
```

**Helper Functions:**
```typescript
// Calculates individual shares based on split type
calculateSplit(expense: Expense): { person: string; amount: number }[]

// Formats date strings to readable format
formatDate(dateString: string): string
```

**Why this approach:**
- Only one expense expanded at a time (better UX)
- Shows detailed breakdown in expanded view
- Confirmation prevents accidental deletions
- Clean, organized display

---

### 6. Balance View (`src/components/BalanceView.tsx`)

**Features Implemented:**

1. **Total Group Spending**
   - Sum of all expense amounts
   - Prominently displayed at top

2. **Individual Balances**
   - For each person shows:
     - How much they paid
     - How much they owe
     - Net balance (paid - owes)
   - Color-coded:
     - Green: Person is owed money (positive balance)
     - Red: Person owes money (negative balance)
     - Gray: Settled up (balance near zero)

3. **Debt Simplification Algorithm**
   - Calculates minimum transactions to settle all debts
   - Example: If A owes B $20 and B owes C $20, simplifies to: A pays C $20

**Key Functions:**

```typescript
// Calculate what each person paid and owes
calculateBalances(): { 
  [person: string]: { 
    paid: number; 
    owes: number; 
    balance: number 
  } 
}

// Simplify debts to minimum transactions
simplifyDebts(): SimplifiedDebt[]
```

**Debt Simplification Algorithm:**

1. Calculate net balance for each person
2. Separate into creditors (owed money) and debtors (owe money)
3. Sort both arrays by amount (largest first)
4. Match creditors with debtors:
   - Take largest creditor and largest debtor
   - Create transaction for minimum of their amounts
   - Reduce both by that amount
   - Move to next when one reaches zero
5. Result: Minimum number of transactions

**Example:**
```
Before:
- Alice paid $100, owes $30 → balance: +$70 (owed)
- Bob paid $50, owes $80 → balance: -$30 (owes)
- Charlie paid $0, owes $40 → balance: -$40 (owes)

Simplified:
- Bob pays Alice $30
- Charlie pays Alice $40
```

**Why this approach:**
- Greedy algorithm provides good simplification
- Easy to understand for users
- Real-time calculations (no separate "calculate" button needed)
- Visual feedback with color coding

---

## Feature Breakdown

### ✅ People Management
- ✅ Add new people with validation
- ✅ Remove people
- ✅ Display current members with count
- ✅ User feedback for all actions
- ✅ Warning when < 2 people

### ✅ Expense Management
- ✅ Add expenses with all required fields
- ✅ Equal split calculation
- ✅ Custom split with validation
- ✅ Delete expenses
- ✅ View expense details
- ✅ Form validation and error messages

### ✅ Balance Calculation & Display
- ✅ Total group spending
- ✅ Individual balances (paid, owes, net)
- ✅ Color-coded balance indicators
- ✅ Debt simplification algorithm
- ✅ Suggested settlements

### ✅ State Management & Data Flow
- ✅ Shared state in App component
- ✅ localStorage persistence
- ✅ Props passed to child components
- ✅ All components update in real-time
- ✅ Data survives page refresh

---

## How to Use the Application

### Initial Setup

1. **Start the Application**
   ```bash
   npm install
   npm run dev
   ```
   
2. **Open in Browser**
   - Navigate to the URL shown (usually http://localhost:5173)

3. **Fresh Start**
   - The app starts with no people and no expenses
   - You'll build your group from scratch
   - Perfect for real-world use!

### Using the App

#### Step 1: Add People

1. Look at the **"👥 Manage People"** section (top left)
2. Enter a person's name in the input field
3. Click **"Add Person"** button
4. Repeat for all people in your group (minimum 2 people required)
5. You'll see a success message and the person appears in the list
6. To remove someone, click the ❌ button next to their name

**Tips:**
- You need at least 2 people to create expenses
- Names must be unique
- Empty names are not allowed

---

#### Step 2: Add Expenses

1. Look at the **"💸 Add Expense"** section (middle left)
2. Fill in the expense details:

   **Description:** What was the expense for?
   - Example: "Dinner at restaurant" or "Uber to airport"

   **Amount:** How much was spent?
   - Example: 45.50

   **Date:** When did this expense occur?
   - Defaults to today, but you can change it

   **Paid By:** Who paid for this expense?
   - Select from dropdown

   **Split Type:** How should this be divided?
   - **Equal Split:** Amount divided equally among selected people
   - **Custom Amounts:** Specify exact amount for each person

   **Split Between:** Who should share this expense?
   - Check boxes for each person who should pay a share
   - If using custom split, enter amount for each person

3. Click **"Add Expense"** button

**Examples:**

**Example 1 - Equal Split:**
- Description: "Lunch"
- Amount: $60
- Paid By: Alice
- Split Type: Equal Split
- Split Between: Alice, Bob, Charlie (all 3 checked)
- Result: Each person owes $20

**Example 2 - Custom Split:**
- Description: "Groceries"
- Amount: $100
- Paid By: Bob
- Split Type: Custom Amounts
- Split Between:
  - Alice: $40
  - Bob: $35
  - Charlie: $25
- Result: Each person owes their custom amount

**Validation:**
- All fields are required
- Amount must be positive
- Must select at least one person to split with
- For custom splits, amounts must total the expense amount exactly

---

#### Step 3: View Balances

Look at the **"💰 Balances"** section (top right)

**Total Group Spending:**
- Shows the sum of all expenses

**Individual Balances:**
- **Green (is owed)**: This person paid more than they owe
- **Red (owes)**: This person owes money
- **Gray (settled up)**: This person is even

**Suggested Settlements:**
- Shows the minimum transactions needed to settle all debts
- Example: "Bob pays Alice $25.00"
- Follow these transactions to settle up

---

#### Step 4: View & Manage Expenses

Look at the **"📝 Expense History"** section (bottom right)

1. **View List:** All expenses are displayed with:
   - Description and amount
   - Date and who paid
   - Arrow button to expand

2. **View Details:** Click on any expense to expand:
   - See split type
   - See how much each person owes
   - Delete button

3. **Delete Expense:** 
   - Expand the expense
   - Click "Delete Expense" button
   - Confirm in the dialog
   - Expense is removed and balances update automatically

---

### Common Workflows

#### Workflow 1: Setting Up a New Group

1. Clear existing people (click ❌ on each)
2. Add your group members
3. Start adding expenses

#### Workflow 2: Settling Up

1. Check the "Suggested Settlements" section
2. Follow the payment instructions
3. When ready to start fresh, delete old expenses
4. Or keep them for records (they stay in localStorage)

#### Workflow 3: Reviewing Expenses

1. Go to Expense History
2. Click on any expense to see details
3. Check who paid what
4. Verify the split is correct

---

### Data Persistence

**Your data is automatically saved!**

- All people and expenses are stored in browser's localStorage
- Data persists even after:
  - Closing the browser
  - Refreshing the page
  - Shutting down computer
  
**To start fresh:**
- Manually remove all people and expenses
- Or clear browser's localStorage for the site

**Important:** 
- Data is stored per browser/device
- Data is not synced across devices
- Clearing browser data will erase your expenses

---

## Technical Decisions & Reasoning

### Why localStorage?

**Pros:**
- ✅ Simple to implement
- ✅ No backend/database needed
- ✅ Works offline
- ✅ Automatic persistence
- ✅ Good for prototypes and assignments

**Cons:**
- ❌ Not synced across devices
- ❌ Limited storage space (5-10MB)
- ❌ Can be cleared by user
- ❌ No user authentication

**For this assignment:** Perfect choice because:
- Requirement is to use localStorage
- Quick implementation
- Demonstrates state management concepts
- No server setup needed

---

### Why Props Drilling Instead of Context?

**Decision:** Pass props from App to components (only 2 levels deep)

**Reasoning:**
- Simple component hierarchy (not deeply nested)
- Easy to understand data flow
- No additional abstractions needed
- Clear and explicit prop passing
- Good for learning and demonstration

**When to use Context/Redux:**
- Many deeply nested components
- Global state needed everywhere
- Complex state interactions
- Large production applications

**For this assignment:** Props drilling is cleaner and simpler

---

### Why Timestamp for IDs?

**Decision:** Use `Date.now()` for expense IDs

```typescript
id: Date.now()
```

**Reasoning:**
- ✅ Simple to implement
- ✅ Guaranteed unique (millisecond precision)
- ✅ No counter to maintain
- ✅ Sortable by creation time

**For production:** Would use UUID or database auto-increment

---

### Why Greedy Algorithm for Debt Simplification?

**Decision:** Match largest creditor with largest debtor

**Reasoning:**
- ✅ Provides good simplification (near-optimal)
- ✅ Easy to implement
- ✅ Fast performance O(n log n)
- ✅ Easy to understand for users

**Alternative:** 
- Optimal solution is NP-hard problem
- Greedy is good enough for practical use

---

### Component Structure

**Each component has:**
1. TypeScript interface for props
2. Local state (useState) for UI-only state
3. Handler functions for user actions
4. JSX for rendering

**Why this structure:**
- Clear separation of concerns
- Easy to test and maintain
- Follows React best practices
- Self-contained components

---

### Validation Strategy

**Client-side only validation**

**Where:**
- PeopleManager: name validation
- ExpenseForm: comprehensive field validation

**Why client-side:**
- Immediate feedback
- Better user experience
- No server in this project

**For production:** Would also have server-side validation

---

### Form Handling

**Controlled Components Pattern**

```typescript
<input 
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

**Why:**
- React owns the state
- Easy to validate
- Easy to reset
- Single source of truth

---

## Code Quality Highlights

### TypeScript Usage
- ✅ Proper interfaces for all props
- ✅ Type-safe state management
- ✅ Typed function parameters and returns
- ✅ No `any` types used
- ✅ Generic hook for reusability

### React Best Practices
- ✅ Functional components
- ✅ Hooks (useState, useEffect)
- ✅ Controlled components
- ✅ Proper key props in lists
- ✅ Event handler naming (handle*)

### Clean Code
- ✅ Descriptive variable names
- ✅ Small, focused functions
- ✅ Comments explaining complex logic
- ✅ Consistent formatting
- ✅ No console.logs (only in error handling)

### User Experience
- ✅ Immediate feedback for actions
- ✅ Confirmation for destructive actions
- ✅ Auto-dismiss notifications
- ✅ Loading states handled
- ✅ Empty states with helpful messages
- ✅ Disabled states when appropriate

---

## Summary

This implementation provides a fully functional expense splitting application with:

1. **Complete People Management** - Add, remove, list members
2. **Full Expense Management** - Add expenses with equal or custom splits
3. **Smart Balance Calculations** - Real-time balance tracking with debt simplification
4. **localStorage Persistence** - All data saved automatically
5. **Great User Experience** - Validation, feedback, confirmations
6. **Clean, Maintainable Code** - TypeScript, React best practices, simple architecture

The code is intentionally kept simple and easy to understand while still being fully functional and following best practices. Every decision prioritizes clarity and simplicity over complexity.

