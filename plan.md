# Refinement of Office Selection and Request Dispatching

## Goal
Improve the granularity of office selection by allowing users to select both a role and a specific office/staff member. Implement a locking mechanism for non-admin users to prevent re-sending requests until they return to their stage.

## Changes

### 1. Granular Office Selection
- **Target**: `src/App.tsx` (Dashboard section)
- **Implementation**:
    - Replace the single "Target Office" dropdown with two distinct selectors:
        1. **Target Role**: Allows selecting the department/stage (e.g., Record, Finance).
        2. **Target Office/Staff**: Dynamically filters based on the selected Role.
    - **Data Source for Target Office/Staff**:
        - Merge static rooms from `config.rooms`.
        - Add active staff members from the `users` list who belong to that role, including their specific office number.
    - **UI Layout**: Use a compact two-select layout within the table cell.

### 2. Request Send Restriction (Locking)
- **Target**: `src/App.tsx` (Dashboard section)
- **Implementation**:
    - The "Send" button will be enabled ONLY if:
        - The user is an **Admin**.
        - OR the request's current `stage` matches one of the user's `roles`.
    - If a non-admin user sends a request, the `stage` changes, effectively locking the button for them until the request is moved back to their role.
    - Add a `Lock` icon and "Locked" label when disabled.
    - Add a tooltip/help text: "Waiting for request to return to your office".

### 3. State Management Updates
- **Target**: `src/App.tsx`
- **Implementation**:
    - Update `pendingMoves` state to store both `role` and `room` for each request ID.
    - Adjust `updateRequestStage` to process these separate values.

### 4. User Interface Refinements
- **Target**: `src/App.tsx`
- **Implementation**:
    - Ensure the "Target Office" selects have clear labels.
    - Maintain existing brand colors and styling.
    - Improve the "Action" column layout to accommodate two selects.
