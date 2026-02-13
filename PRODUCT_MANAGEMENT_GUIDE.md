# Product Management System Documentation

## 🚀 Getting Started Tour (5 Minutes)

Welcome! This quick tour will show you how to use the Product Management system in just 5 minutes.

### Your First Time - Follow These Steps:

---

#### 🎯 STOP 1: Understand the Interface (30 seconds)

**What you see:**
```
┌─────────────────────────────────────────────────────────────┐
│  Board │ Backlog │ Sprints │ Timeline │ Reports      [+ Create Issue] │
├─────────────────────────────────────────────────────────────┤
│  Sprint: [Backlog (No Sprint) ▼]    1 Done │ 1 In Progress │ 1 To Do  │
├─────────────────────────────────────────────────────────────┤
│  [Board] [List] [Calendar]    [All Priority ▼]  [Search...]         │
└─────────────────────────────────────────────────────────────┘
```

**Key Areas:**
- **Top Navigation**: Switch between Board, Backlog, Sprints, etc.
- **Sprint Selector**: Choose which sprint to view
- **View Modes**: Board (kanban), List (table), Calendar (schedule)
- **Create Button**: Blue button to add new issues

---

#### 🎯 STOP 2: Create Your First Sprint (1 minute)

**Why**: Sprints help organize work into time-boxed iterations

**Steps:**
1. Click **"Sprints"** tab at the top
2. Click **"Create Sprint"** button
3. Fill in:
   - **Name**: "Sprint 1" (or any name)
   - **Goal**: "Complete initial features"
   - **Start Date**: Today
   - **End Date**: 2 weeks from today
4. Click **"Create"**

**✅ Success**: You see your new sprint in the list

---

#### 🎯 STOP 3: Create Your First Issue (1 minute)

**Why**: Issues represent work items (tasks, bugs, stories)

**Steps:**
1. Click **"Board"** tab to return to board view
2. Click blue **"+ Create Issue"** button (top right)
3. Fill in:
   - **Title**: "Setup project repository"
   - **Type**: "Task"
   - **Priority**: "High"
   - **Assignee**: Select a team member
   - **Due Date**: Pick a date
   - **Sprint**: Select the sprint you just created
4. Click **"Create Issue"**

**✅ Success**: Issue appears on the board!

---

#### 🎯 STOP 4: Move Issues on the Board (1 minute)

**Why**: Track progress by moving issues through workflow

**The Board Columns:**
- **Backlog** → Work not started
- **Selected** → Ready to work on
- **In Progress** → Currently working
- **Done** → Completed

**Try This:**
1. Find your new issue in "Backlog" column
2. **Drag and drop** it to "In Progress" column
3. Click on the issue card to open details
4. Add **Estimated Hours**: 8
5. Close the modal

**✅ Success**: Issue moved and time estimated!

---

#### 🎯 STOP 5: Check the Calendar (30 seconds)

**Why**: See all issues by their due dates

**Steps:**
1. Click **"Calendar"** button (next to List)
2. See your issue on its due date
3. Click on that date to see details
4. Click the date again to close

**✅ Success**: You can visualize your schedule!

---

### 🎉 You're Ready!

**What you learned:**
- ✅ Create sprints to organize work
- ✅ Create issues with details
- ✅ Move issues through workflow
- ✅ Track time estimates
- ✅ View calendar schedule

**Next Steps:**
- Create more issues for your team
- Assign issues to different people
- Try the List view for bulk editing
- Check Reports to see progress

---

### Quick Reference Card

| Want To... | Do This... |
|------------|-----------|
| Create work item | Click "+ Create Issue" |
| Change status | Drag card to new column |
| View by sprint | Use "Sprint" dropdown |
| See schedule | Click "Calendar" view |
| Edit issue | Click on any issue card |
| Add to sprint | Edit issue → select sprint |

---

## Overview

A comprehensive Jira-style project management system built with Next.js, TypeScript, and PostgreSQL. Features sprint planning, kanban boards, calendar views, and issue tracking.

## Features

### 1. Issue Management

#### Issue Types
- **Story** - User stories and feature requirements
- **Task** - Development tasks and work items
- **Bug** - Bug reports and issues
- **Epic** - Large bodies of work that span multiple sprints

#### Issue Properties
- **Title** - Issue name/title (required)
- **Description** - Detailed description
- **Type** - Story, Task, Bug, or Epic
- **Priority** - Highest, High, Medium, Low, Lowest
- **Status** - Backlog, Selected, In Progress, Done
- **Assignee** - Team member assigned to the issue
- **Reporter** - Person who created the issue
- **Story Points** - Effort estimation (fibonacci: 1, 2, 3, 5, 8, 13, 21)
- **Labels** - Tags for categorization
- **Due Date** - Target completion date
- **Estimated Hours** - Time estimation
- **Actual Hours** - Time spent

### 2. Sprint Management

#### Sprint States
- **Future** - Planned but not started
- **Active** - Currently in progress
- **Closed** - Completed

#### Sprint Properties
- **Name** - Sprint identifier (e.g., "Sprint 13")
- **Goal** - Sprint objective/description
- **Start Date** - Sprint begin date
- **End Date** - Sprint end date
- **Issues** - Collection of issues in the sprint

#### Sprint Workflow
1. Create sprint with name, goal, and dates
2. Add issues to sprint
3. Start sprint (changes state to 'active')
4. Complete sprint (changes state to 'closed')

### 3. Kanban Board

#### Columns
- **Backlog** - Issues not yet prioritized
- **Selected** - Issues ready for development
- **In Progress** - Currently being worked on
- **Done** - Completed issues

#### Features
- **Drag & Drop** - Move issues between columns
- **Sprint Filtering** - View issues by sprint
- **Search** - Filter issues by title or key
- **Issue Cards** - Compact view with key info
- **Priority Colors** - Visual priority indicators

### 4. Calendar View

#### Features
- **Monthly View** - See issues by due date
- **Status Distribution** - Visual progress indicators
- **Issue Preview** - Quick view of day's issues
- **Modal Details** - Click date for detailed view
- **Today Highlighting** - Current date emphasized

#### Visual Elements
- **Progress Circle** - Completion percentage
- **Status Badges** - Done, In Progress, Pending counts
- **Issue Cards** - Key and title preview
- **No Due Date Indicator** - Calendar icon for unscheduled

### 5. List/Backlog View

#### Table Columns
- Issue (key + title)
- Type
- Priority
- Status
- Assignee
- Story Points
- Due Date

#### Features
- Sortable columns
- Search/filter
- Quick access to issue details

### 6. Time Tracking

#### Features
- **Estimated Hours** - Planned time
- **Actual Hours** - Time spent
- **Comparison** - See estimate vs actual

#### Display Format
- Clean inline format with icons
- Clock icon for estimates
- CheckCircle icon for actual
- Whole numbers only (no decimals)

### 7. Issue Details Modal

#### Information Displayed
- Issue key and title
- Full description
- Type, priority, status
- Assignee and reporter
- Sprint assignment
- Due date
- Story points
- Labels
- Time tracking
- Comments and activity

### 8. Database Schema

#### Tables

**sprints**
```sql
- id (SERIAL PRIMARY KEY)
- name (VARCHAR)
- goal (TEXT)
- state (ENUM: future, active, closed)
- start_date (DATE)
- end_date (DATE)
- created_by (INTEGER, FK to users)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**issues**
```sql
- id (SERIAL PRIMARY KEY)
- key (VARCHAR UNIQUE) - e.g., PROD-101
- title (VARCHAR)
- description (TEXT)
- type (ENUM: story, task, bug, epic)
- priority (ENUM: lowest, low, medium, high, highest)
- status (ENUM: backlog, selected, in-progress, done)
- assignee_id (INTEGER, FK to users)
- reporter_id (INTEGER, FK to users)
- sprint_id (INTEGER, FK to sprints)
- parent_id (INTEGER, FK to issues - for subtasks)
- story_points (INTEGER)
- labels (TEXT[])
- due_date (DATE)
- estimated_hours (DECIMAL)
- actual_hours (DECIMAL)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- resolved_at (TIMESTAMP)
```

**issue_comments**
```sql
- id (SERIAL PRIMARY KEY)
- issue_id (INTEGER, FK)
- user_id (INTEGER, FK)
- content (TEXT)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

**issue_history**
```sql
- id (SERIAL PRIMARY KEY)
- issue_id (INTEGER, FK)
- user_id (INTEGER, FK)
- field (VARCHAR)
- old_value (TEXT)
- new_value (TEXT)
- created_at (TIMESTAMP)
```

## API Endpoints

### Issues
- `GET /api/product/issues` - List all issues
- `GET /api/product/issues/:id` - Get single issue
- `POST /api/product/issues` - Create issue
- `PUT /api/product/issues/:id` - Update issue
- `DELETE /api/product/issues/:id` - Delete issue
- `POST /api/product/issues/:id/move` - Move issue (drag & drop)
- `POST /api/product/issues/:id/comments` - Add comment

### Sprints
- `GET /api/product/sprints` - List sprints
- `POST /api/product/sprints` - Create sprint
- `PUT /api/product/sprints/:id` - Update sprint
- `DELETE /api/product/sprints/:id` - Delete sprint

### Board
- `GET /api/product/board` - Get board data (grouped by status)
- `GET /api/product/calendar` - Get calendar data (grouped by date)
- `GET /api/product/reports` - Get statistics

## Frontend Components

### ProductManagement.tsx
Main component with state management for:
- Board data (backlog, selected, in-progress, done)
- Sprints list
- Calendar data
- Filters and view modes
- Modal states

### IssueCard.tsx
Reusable card component showing:
- Issue key and priority
- Title and description
- Assignee avatar
- Story points
- Due date
- Labels
- Time tracking

### Calendar Components
- Calendar grid with month navigation
- Day cells with issue counts
- Progress indicators
- Modal for date details

## Key Features Summary

### 1. Sprint Planning
- Create and manage sprints
- Assign issues to sprints
- Track sprint progress
- Filter board by sprint

### 2. Issue Tracking
- Full CRUD operations
- Status workflow
- Priority management
- Assignment and scheduling
- Time tracking

### 3. Visual Management
- Kanban board with drag & drop
- Calendar view for scheduling
- List view for detailed analysis
- Progress indicators

### 4. Collaboration
- Comments on issues
- Activity history
- User assignments
- Due date notifications

## Usage Workflow

### Quick Start Guide

```
┌─────────────────────────────────────────────────────────┐
│                    GETTING STARTED                       │
└─────────────────────────────────────────────────────────┘

Step 1: CREATE A SPRINT
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Sprints    │ → │  + Create   │ → │ Fill Details │
│    Tab      │     │   Sprint    │     │  & Save     │
└─────────────┘     └─────────────┘     └─────────────┘

Step 2: CREATE ISSUES
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  + Create   │ → │  Fill Form  │ → │   Assign to   │
│   Issue     │     │  (Title,    │     │    Sprint   │
│             │     │  Type, etc) │     │   (Optional)│
└─────────────┘     └─────────────┘     └─────────────┘

Step 3: MANAGE WORK
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Board     │ → │ Drag & Drop  │ → │  Track Time   │
│   View      │     │  to Change  │     │   & Progress  │
│             │     │   Status    │     │               │
└─────────────┘     └─────────────┘     └─────────────┘

Step 4: MONITOR PROGRESS
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Calendar   │ → │   Reports   │ → │   Complete    │
│    View     │     │   & Stats   │     │    Sprint   │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Detailed Workflows

#### 🎯 Sprint Planning Workflow

**Who**: Product Manager / Scrum Master
**When**: Before sprint starts

1. **Navigate to Sprints**
   - Click "Sprints" tab in top navigation
   - View existing sprints

2. **Create New Sprint**
   - Click "Create Sprint" button
   - Enter sprint name (e.g., "Sprint 13")
   - Write sprint goal (what we want to achieve)
   - Set start date and end date
   - Click "Create"

3. **Plan Issues**
   - Review backlog
   - Select issues for sprint
   - Assign to sprint
   - Ensure balanced workload

#### 📝 Issue Creation Workflow

**Who**: Product Manager / Team Lead / Developer
**When**: New work identified

1. **Create Issue**
   - Click blue "Create Issue" button (top right)
   - Modal opens with form

2. **Fill Required Fields**
   - **Title**: Clear, descriptive name
   - **Type**: Story, Task, Bug, or Epic
   - **Priority**: Highest → Lowest

3. **Add Details**
   - **Description**: What needs to be done
   - **Assignee**: Who will work on it
   - **Due Date**: When it should be complete
   - **Story Points**: Effort estimate

4. **Assign to Sprint (Optional)**
   - Select sprint from dropdown
   - Or leave unassigned for backlog

5. **Save**
   - Click "Create Issue"
   - Appears on board immediately

#### 📊 Daily Work Workflow

**Who**: Developers / Team Members
**When**: Daily work routine

1. **View Your Issues**
   - Go to Board view
   - Filter by sprint
   - Find your assigned issues

2. **Update Status**
   - Drag issue from "Selected" to "In Progress"
   - Work on the issue

3. **Track Time**
   - Log estimated hours when starting
   - Update actual hours as you work

4. **Move to Done**
   - When complete, drag to "Done" column
   - Add any final notes

5. **Review Calendar**
   - Check upcoming due dates
   - Reschedule if needed

#### 📅 Sprint Review Workflow

**Who**: Whole Team
**When**: End of sprint

1. **Check Sprint Progress**
   - View board, see items in "Done"
   - Check reports for velocity

2. **Complete Sprint**
   - Move any unfinished items back to backlog
   - Close sprint (changes state to "closed")

3. **Retrospective**
   - What went well?
   - What could improve?
   - Update process for next sprint

4. **Start New Sprint**
   - Create next sprint
   - Plan new issues
   - Begin cycle again

### User Roles

#### 👤 Product Manager
- Create and prioritize issues
- Plan sprints
- Monitor overall progress
- Generate reports

#### 👨‍💻 Developer
- View assigned issues
- Update status
- Track time
- Mark complete

#### 🏃 Scrum Master
- Create sprints
- Facilitate planning
- Monitor workflow
- Remove blockers

### Common Actions

| Action | Where | How |
|--------|-------|-----|
| Create Issue | Any view | Click "+ Create Issue" button |
| Move Issue | Board | Drag & drop to new column |
| Edit Issue | Anywhere | Click on issue card |
| Filter by Sprint | Board | Use dropdown above board |
| View Calendar | Navigation | Click "Calendar" view mode |
| Search Issues | Board/List | Use search bar |
| Add Comment | Issue modal | Click "Comments" tab |
| Track Time | Issue modal | Edit estimated/actual hours |

### Tips for Success

✅ **DO:**
- Keep issue titles clear and specific
- Update status daily
- Log hours as you work
- Set realistic due dates
- Use priority wisely

❌ **DON'T:**
- Overload sprints
- Forget to update status
- Skip time tracking
- Leave issues unassigned
- Miss due dates without updating

### Keyboard Shortcuts

- `Ctrl + N` - Create new issue
- `Ctrl + F` - Search issues
- `Ctrl + B` - Board view
- `Ctrl + L` - List view
- `Ctrl + C` - Calendar view

### Need Help?

If something isn't working:
1. Check you're in the right sprint/filter
2. Refresh the page
3. Check browser console for errors
4. Verify you have permissions
5. Contact admin if issues persist

## Date and Time Formats

### Displayed in UI
- **Dates**: "Fri 12 2026" (weekday day year)
- **Hours**: "Est 8h" or "Actual 5h" (whole numbers)
- **Calendar**: "February 2026" for month headers

### Stored in Database
- **Dates**: DATE type (YYYY-MM-DD)
- **Timestamps**: TIMESTAMP without timezone
- **Hours**: DECIMAL for precision

## Color Coding

### Priority Colors
- Highest: Red
- High: Orange
- Medium: Yellow
- Low: Blue
- Lowest: Gray

### Status Colors
- Done: Green
- In Progress: Blue/Indigo
- Selected: Blue
- Backlog: Gray

### Type Icons
- Story: Blue circle
- Task: Gray circle
- Bug: Red circle
- Epic: Purple circle

## Best Practices

1. **Issue Creation**
   - Clear, descriptive titles
   - Detailed descriptions
   - Set realistic due dates
   - Estimate story points

2. **Sprint Planning**
   - Define clear sprint goals
   - Don't overload sprints
   - Balance workload
   - Include buffer time

3. **Daily Management**
   - Update issue status
   - Track actual hours
   - Add comments for context
   - Review calendar daily

4. **Time Tracking**
   - Estimate before starting
   - Log actual hours daily
   - Compare for future planning
   - Use for velocity calculation

## Troubleshooting

### Common Issues

**Issue creation fails**
- Check all required fields
- Verify assignee exists
- Ensure sprint is valid

**Board not updating**
- Refresh the page
- Check sprint filter
- Verify API connection

**Calendar not showing issues**
- Check due dates are set
- Verify calendar API response
- Clear browser cache

### Error Messages

- "Failed to create issue" - Check field validation
- "Invalid input syntax" - Verify data types
- "Database error" - Check connection

## Future Enhancements

Potential features to add:
- Burndown charts
- Velocity tracking
- Sprint retrospectives
- Email notifications
- File attachments
- Custom fields
- Workflow automation
- Team velocity reports
- Epic progress tracking
- Subtask management

## Support

For issues or questions:
- Check browser console for errors
- Verify API endpoints are accessible
- Review database connection
- Check user permissions
