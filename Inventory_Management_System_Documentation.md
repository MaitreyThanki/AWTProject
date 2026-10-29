# Software Requirements Specification (SRS)
## Inventory Management System Web Application

**Document version:** 2.0  
**Updated:** 16 October 2026  
**Technology baseline:** React + Vite, Express.js, MongoDB + Mongoose, JWT authentication, bcrypt password hashing, and Multer uploads

> This SRS distinguishes intended system requirements from functionality present in the current starter implementation. Features described as requirements are not necessarily implemented yet.

## 1. Project Overview

The Inventory Management System is a web application for managing lab equipment borrowing, approval, return tracking, reminders, and penalties for the following labs:

1. Makers Lab 2
2. Design IoT Lab

The system will allow students to browse available lab items, request items, upload required documents, and track their borrowing status. Faculty members will review and approve requests. Admin users will manage inventory, monitor student borrowing records, review documents, and override approval decisions when required.

## 2. Objectives

- Provide a centralized platform for lab inventory management.
- Allow students to check item availability before requesting equipment.
- Digitize the borrowing approval workflow.
- Maintain proper records of students, borrowed items, approvals, returns, and penalties.
- Help faculty review requests and uploaded documents efficiently.
- Allow admins to manage inventory and override approval decisions when necessary.
- Send reminders for item return deadlines.
- Track penalties for late returns, damaged items, or lost items.

## 3. User Roles

The system will have three main roles:

### 3.1 Student

Students can:

- Log in using academic and personal details.
- Browse available inventory by lab.
- Add required items to cart.
- Submit a borrow request.
- Upload required documents for faculty review.
- View approval status.
- View return deadlines.
- Receive return reminders.
- View penalties, if any.

### 3.2 Faculty

Faculty members can:

- View item requests related to their assigned lab.
- Review student details.
- Review uploaded documents.
- Approve or reject borrow requests.
- Manage inventory availability.
- Track borrowed and returned items.
- Add remarks for approval or rejection.

### 3.3 Admin

Admin users can:

- View all student borrowing records.
- View current and past item history.
- Add, edit, or remove inventory items.
- Review uploaded documents.
- Override faculty approval decisions.
- Manage penalties.
- Track all lab inventory across Makers Lab 2 and Design IoT Lab.

## 4. System Modules

## 4.1 Authentication and Login

### 4.1.1 Current Login Page Behaviour

The current React login page is available at `/login` and is titled **Lab Inventory Login**. It contains:
- A role selector with **Student** and **Faculty** options.
- An email field.
- A password field that masks typed characters.
- A Login button.
- A message area for successful login or errors.

On submission, the frontend sends `POST /api/auth/login` with `email`, `password`, and `role`. On success, the API returns a JWT token and public user information; the frontend stores the token in browser local storage and displays a success message. On failure, the page displays the API error message when available.

**Current implementation limitations:** the login page does not currently include student registration, faculty password reset/change, OTP/Authenticator verification, or an admin role option. Successful login currently displays a message but does not itself redirect the user to a role-specific dashboard. These items remain future requirements unless implemented separately.

### 4.1.2 Student Registration Requirements

Student self-registration is exposed by the backend endpoint `POST /api/auth/student/register`. The registration workflow should collect:
- Name
- University email
- Phone number
- University program
- Residence type (home/hostel)
- Password
- Confirm password (frontend validation requirement)

The current frontend login page does not provide the registration form; a registration screen and password-confirmation validation are required to make this workflow accessible through the UI.

### 4.1.3 Faculty Accounts

Faculty accounts are expected to be provisioned by an administrator or seeded for development. The current login API authenticates faculty using email, password, and the `faculty` role. Emailing a generated password and forcing a password change are proposed requirements and are not currently implemented in the login page.

### 4.1.4 Admin Accounts

Admin accounts are provisioned through controlled setup/seed operations. Admin is intentionally not an option in the current login role selector, and there is no implemented Authenticator OTP login flow in the current login page. If admin sign-in is required, it needs an explicit, secure design and implementation; it must not be assumed to work through the existing page.
## 4.2 Student Side

### 4.2.1 Browsing Page

The browsing page should display inventory items divided by lab sections.

Required lab sections:

- Makers Lab 2
- Design IoT Lab

Each item should display:

- Item name
- Item image, if available
- Lab name
- Category
- Available quantity
- Total quantity
- Item condition
- Borrowing duration allowed
- Faculty in-charge email address
- Add to cart button

Example item categories:

- Electronics
- Sensors
- Microcontrollers
- Mechanical tools
- Measuring instruments
- Prototyping tools
- Lab accessories

### 4.2.2 Cart and Checkout Page

The checkout page should allow students to review selected items before submitting a request.

The page should include:

- Student details summary
- Selected item list
- Quantity requested for each item
- Lab name for each item
- Expected borrow date
- Expected return date
- Purpose of borrowing
- Faculty in-charge email address
- Uploaded document section
- Terms and conditions checkbox
- Submit request button

Required upload document section:

- Students should upload documents required by the faculty in-charge.
- Supported file formats may include PDF, JPG, JPEG, and PNG.
- Uploaded documents should be available for faculty and admin review.

Example documents:

- Faculty permission letter
- Project approval letter
- Lab request form
- Student ID proof

## 4.3 Faculty Side

### 4.3.1 Faculty Dashboard

The faculty dashboard should show:

- Pending requests
- Approved requests
- Rejected requests
- Currently borrowed items
- Overdue items
- Inventory summary for assigned lab

### 4.3.2 Approval System

Faculty should be able to:

- Open a student request.
- View student profile details.
- View selected items.
- Review uploaded documents.
- Approve the request.
- Reject the request.
- Add remarks.
- Set or modify return date.

Approval status values:

- Pending
- Approved
- Rejected
- Returned
- Overdue
- Cancelled

### 4.3.3 Inventory Management

Faculty should be able to manage inventory for their assigned lab.

Faculty inventory actions:

- View item availability.
- Update item quantity.
- Mark item condition.
- Mark item as unavailable.
- View item borrowing history.
- Confirm item return.
- Report damaged or missing items.

## 4.4 Admin Side

### 4.4.1 Admin Dashboard

The admin dashboard should provide a complete overview of both labs.

Dashboard sections:

- Total inventory items
- Available items
- Borrowed items
- Pending approvals
- Overdue returns
- Active penalties
- Recent borrowing activity

### 4.4.2 Student Borrowing List

Admin should be able to view a list of students who have borrowed items.

Student list should include:

- Student name
- Enrollment number
- Semester
- Division
- Residence type
- Borrowed item names
- Lab name
- Borrow date
- Return date
- Current status
- Penalty status

Admin should be able to filter records by:

- Lab
- Student enrollment number
- Status
- Date
- Item name
- Penalty status

### 4.4.3 Item History Tab

Each inventory item should have a history tab.

Item history should include:

- Item name
- Item ID
- Lab name
- Total quantity
- Available quantity
- Borrowing history
- Student who borrowed the item
- Approval details
- Return date
- Damage or loss reports
- Penalty records

### 4.4.4 Document Review

Admin should be able to review documents uploaded by students.

Document review should include:

- Student name
- Enrollment number
- Request ID
- Uploaded file name
- Upload date
- Preview or download option
- Faculty decision
- Admin remarks

### 4.4.5 Add Items System

Admin should be able to add new inventory items.

Required item fields:

- Item name
- Item ID or asset code
- Lab name
- Category
- Description
- Total quantity
- Available quantity
- Condition
- Borrowing duration
- Faculty in-charge name
- Faculty in-charge email
- Item image, optional

Admin should also be able to:

- Edit item details.
- Remove items.
- Update quantity.
- Mark items as damaged.
- Mark items as unavailable.

### 4.4.6 Override System

Admin should have the authority to override faculty decisions.

Override actions:

- Approve a rejected request.
- Reject an approved request.
- Extend return deadline.
- Cancel penalty.
- Add penalty manually.
- Mark item as returned.

Every override should require:

- Admin name
- Override reason
- Date and time
- Previous status
- Updated status

All override actions must be recorded in the system history for accountability.

## 5. Complete System Flow

### Step 1: Student Checks Availability

The student logs in and browses the inventory page. Items are shown under Makers Lab 2 and Design IoT Lab sections. The student checks whether the required item is available.

### Step 2: Student Adds Item to Cart

The student adds available items to the cart and proceeds to checkout.

### Step 3: Student Uploads Document

On the checkout page, the student uploads the required document for faculty review and submits the request.

### Step 4: Faculty Receives Request

The faculty in-charge of the selected lab receives the request. The faculty email address should be visible in the web app so students know whom to contact.

### Step 5: Faculty Reviews Request

Faculty reviews:

- Student details
- Requested items
- Uploaded documents
- Purpose of borrowing
- Expected return date

### Step 6: Faculty Approves or Rejects

If approved, the student can collect the item from the lab. If rejected, the student can view the rejection reason.

### Step 7: Student Collects Item

After approval, the lab staff or faculty confirms that the item has been issued to the student. The inventory quantity is updated automatically.

### Step 8: Reminder System

The system sends reminders before and after the return deadline.

Suggested reminder schedule:

- 2 days before return date
- On return date
- 1 day after due date
- Every 2 days after overdue until item is returned

Reminder methods:

- Email notification
- Dashboard notification
- Optional SMS notification in future

### Step 9: Item Return

When the student returns the item, faculty or admin verifies the item condition and marks it as returned.

### Step 10: Penalty System

If the item is returned late, damaged, or lost, the system calculates or records a penalty.

## 6. Penalty System

Penalties may be applied for:

- Late return
- Damaged item
- Lost item
- Returning incomplete components
- Returning wrong item

Suggested penalty rules:

- Late return: fixed amount per day
- Damaged item: based on repair cost
- Lost item: based on replacement cost
- Incomplete kit: based on missing component cost

Penalty record should include:

- Student name
- Enrollment number
- Item name
- Reason for penalty
- Penalty amount
- Date applied
- Payment status
- Admin or faculty remarks

Penalty status values:

- No penalty
- Pending
- Paid
- Waived

## 7. Notifications

The system should send notifications for:

- Request submitted
- Request approved
- Request rejected
- Item issue confirmation
- Upcoming return deadline
- Overdue item
- Penalty applied
- Penalty cleared
- Admin override decision

Notification channels:

- Email
- In-app dashboard notification

## 8. MongoDB Database Design

The system uses MongoDB as its primary database, accessed by Mongoose models. Data is organized into collections containing BSON documents. Mongoose creates collections as documents are inserted; the database initialization script creates model indexes.

The database will use a combination of:

* Separate collections for independently managed entities.
* Embedded documents for data that belongs closely to a parent record.
* MongoDB ObjectId references where relationships between collections are required.

### 8.1 Users Collection

The `users` collection will store student, faculty, and admin accounts. Passwords are stored as bcrypt hashes, not plaintext.

Fields:

* `_id`
* `name`
* `email`
* `passwordHash`
* `role`
* `phone`
* `enrollmentNumber`
* `universityProgram`
* `semester`
* `division`
* `residenceType`
* `createdAt`
* `updatedAt`

Role values:

* `student`
* `faculty`
* `admin`

---

### 8.2 Labs Collection

The `labs` collection will store laboratory information.

Fields:

* `_id`
* `name`
* `facultyInchargeName`
* `facultyInchargeEmail`
* `createdAt`
* `updatedAt`

Required labs:

* Makers Lab 2
* Design IoT Lab

---

### 8.3 Inventory Collection

The `inventory_items` collection will store all lab equipment.

Fields:

* `_id`
* `name`
* `assetCode`
* `labId`
* `category`
* `description`
* `totalQuantity`
* `availableQuantity`
* `condition`
* `status`
* `borrowDurationDays`
* `imageUrl`
* `createdAt`
* `updatedAt`

Status values:

* `available`
* `unavailable`
* `damaged`

---

### 8.4 Borrow Requests Collection

The `borrow_requests` collection will store student borrowing requests.

Fields:

* `_id`
* `studentId`
* `expectedBorrowDate`
* `expectedReturnDate`
* `actualReturnDate`
* `purpose`
* `status`
* `facultyRemarks`
* `adminRemarks`
* `items`
* `documents`
* `approvals`
* `createdAt`
* `updatedAt`

Status values:

* `pending`
* `approved`
* `rejected`
* `issued`
* `returned`
* `overdue`
* `cancelled`

#### Embedded Items

Each request will contain an `items` array.

Each item will contain:

* `itemId`
* `itemName`
* `quantityRequested`
* `quantityIssued`
* `returnStatus`

Example:

```json
{
  "items": [
    {
      "itemId": "ObjectId",
      "itemName": "Arduino Starter Kit",
      "quantityRequested": 2,
      "quantityIssued": 2,
      "returnStatus": "issued"
    }
  ]
}
```

This replaces the separate relational `BorrowRequestItems` table.

---

### 8.5 Documents

Document metadata is stored in a separate Mongoose `Document` collection, with `requestId` and `uploadedBy` ObjectId references. The actual uploaded file is stored on disk under `server/uploads/`.

Each document record contains:
- `_id`
- `requestId`
- `uploadedBy`
- `fileName`
- `filePath`
- `fileType`
- `createdAt` and `updatedAt`

The current upload middleware accepts PDF, JPG, JPEG, and PNG files up to 5 MB. Authorization for accessing uploaded files must be enforced by authenticated endpoints; the upload directory should not be exposed without access controls.

---

### 8.6 Approvals

Approval information may be embedded inside the corresponding borrowing request.

Each approval record will contain:

* `facultyId`
* `decision`
* `remarks`
* `decisionDate`

Decision values:

* `approved`
* `rejected`

---

### 8.7 Override Logs Collection

The `override_logs` collection will store administrative overrides.

Fields:

* `_id`
* `requestId`
* `adminId`
* `previousStatus`
* `updatedStatus`
* `reason`
* `overrideDate`

All override actions must be retained for accountability.

---

### 8.8 Penalties Collection

The `penalties` collection will store penalties associated with students and borrowing requests.

Fields:

* `_id`
* `requestId`
* `studentId`
* `itemId`
* `reason`
* `amount`
* `status`
* `remarks`
* `createdAt`
* `updatedAt`

Penalty status values:

* `pending`
* `paid`
* `waived`

---

### 8.9 Item History Collection

The `item_history` collection will maintain inventory audit history.

Fields:

* `_id`
* `itemId`
* `requestId`
* `studentId`
* `action`
* `previousQuantity`
* `updatedQuantity`
* `remarks`
* `createdAt`

This collection will be used to track borrowing, returning, quantity changes, damage, loss, and other inventory events.

---

### 8.10 MongoDB Relationships

MongoDB will use ObjectId references for relationships between independently managed collections.

Main relationships:

* `users._id` → `borrow_requests.studentId`
* `labs._id` → `inventory_items.labId`
* `inventory_items._id` → `borrow_requests.items.itemId`
* `borrow_requests._id` → `penalties.requestId`
* `users._id` → `penalties.studentId`
* `inventory_items._id` → `penalties.itemId`
* `borrow_requests._id` → `override_logs.requestId`
* `users._id` → `override_logs.adminId`
* `inventory_items._id` → `item_history.itemId`
* `borrow_requests._id` → `item_history.requestId`
* `users._id` → `item_history.studentId`

MongoDB indexes should be created for frequently searched fields such as:

* User email
* User role
* Inventory asset code
* Inventory lab ID
* Borrow request student ID
* Borrow request status
* Borrow request creation date
* Penalty student ID
* Item history item ID


## 9. File System / Project Structure

The project is organized as a full-stack web application with a React frontend, an Express backend, a MongoDB/Mongoose data layer, and a server-side upload directory for student documents.

Recommended file system structure:

```text
Inventory_Management_System/
├── Inventory_Management_System_Documentation.md
├── README.md
├── package.json
├── package-lock.json
├── client/
│   ├── index.html
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── api/
│       │   └── http.js
│       ├── components/
│       │   └── MetricCard.jsx
│       ├── layouts/
│       │   └── AppLayout.jsx
│       ├── pages/
│       │   ├── AdminDashboard.jsx
│       │   ├── FacultyDashboard.jsx
│       │   ├── InventoryPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── PenaltiesPage.jsx
│       │   ├── RequestsPage.jsx
│       │   └── StudentDashboard.jsx
│       └── styles/
│           └── app.css
└── server/
    ├── package.json
    ├── uploads/
    │   └── .gitkeep
    └── src/
        ├── app.js
        ├── server.js
        ├── config/
        │   └── database.js
        ├── controllers/
        ├── middleware/
        ├── models/
        ├── routes/
        ├── scripts/
        ├── services/
        └── utils/
```

### 9.1 Root Files

- `Inventory_Management_System_Documentation.md`: Main system documentation and requirements.
- `README.md`: Setup instructions, stack summary, API overview, and starter account information.
- `package.json`: Root project scripts for installing dependencies and running the app.
- `package-lock.json`: Locked dependency versions.

### 9.2 Client File System

The `client/` folder contains the frontend application.

- `client/index.html`: Main HTML entry point for the Vite app.
- `client/src/main.jsx`: React application bootstrap file.
- `client/src/App.jsx`: Main route and application composition file.
- `client/src/api/http.js`: Shared HTTP client configuration for backend API calls.
- `client/src/components/`: Reusable UI components.
- `client/src/layouts/`: Shared page layout components.
- `client/src/pages/`: Role-based and feature-specific pages.
- `client/src/styles/`: Application CSS files.

### 9.3 Server File System

The `server/` folder contains the Express.js backend application.

* `server/src/app.js`: Express app configuration, middleware setup, and route mounting.
* `server/src/server.js`: Server startup file.
* `server/src/config/database.js`: MongoDB connection configuration.
* `server/src/models/`: Mongoose schemas and models for users, labs, inventory items, borrowing requests, penalties, overrides, and item history.
* `server/src/controllers/`: Business logic for each API feature.
* `server/src/routes/`: API route definitions grouped by feature.
* `server/src/middleware/`: Authentication, upload handling, and error handling middleware.
* `server/src/services/`: Shared backend services such as email notifications.
* `server/src/scripts/`: Database connection, seed, and initialization scripts.
* `server/src/utils/`: Shared utility functions and constants.

### 9.4 Upload File System

Uploaded student documents are stored in:

```text
server/uploads/
```

Upload rules:

- Supported file types: PDF, JPG, JPEG, and PNG.
- Maximum file size: 5 MB.
- Uploaded files should be renamed by the server to avoid filename conflicts.
- The original file name, stored file path, MIME type, uploader role, and request ID should be saved in the `Documents` database table.
- Faculty and admin users should access uploaded documents through authenticated API routes, not by directly browsing the upload folder.
- The `server/uploads/.gitkeep` file exists only to keep the empty upload directory in version control.
- Actual uploaded documents should not be committed to version control.

### 9.5 File System Security Requirements

- Uploaded files must be validated before storage.
- Only authenticated users should upload or view documents.
- Students should only access documents linked to their own requests.
- Faculty should only access documents for requests assigned to their lab.
- Admin users may access all uploaded documents.
- File paths returned by the API should not expose unnecessary internal server details.
- The server should prevent path traversal and direct access to unauthorized files.
- Production deployments should store uploads in a protected disk location or object storage service with access control.

## 10. Page List

### Student Pages

- Student login page
- Student dashboard
- Inventory browsing page
- Item detail page
- Cart page
- Checkout page
- Request status page
- Borrowing history page
- Penalty page

### Faculty Pages

- Faculty login page
- Faculty dashboard
- Pending approval page
- Request detail page
- Document review page
- Inventory management page
- Borrowed item tracking page
- Return confirmation page

### Admin Pages

- Admin login page
- Admin dashboard
- Student borrowing list page
- Inventory management page
- Add item page
- Edit item page
- Item history page
- Document review page
- Override approval page
- Penalty management page

## 11. Security Requirements

- Role-based access control must be implemented.
- Students should only access their own requests and records.
- Faculty should only access requests for assigned labs unless given extra permission.
- Admin should have full system access.
- Uploaded documents should be stored securely.
- Passwords must be encrypted.
- All approval and override actions must be logged.
- Important actions should require confirmation.

## 12. Functional Requirements

### 12.1 Authentication Requirements
- The system must authenticate users with email, password, and a selected role.
- The system must hash passwords with bcrypt and must never store plaintext passwords.
- The system must issue a JWT after successful authentication.
- The frontend must attach the JWT as a Bearer token to protected API requests.
- Invalid credentials must produce a clear error message without revealing whether a particular email exists.
- Student registration must validate required fields and password confirmation.
- Role-specific access must be enforced by backend authorization middleware, not only by hiding frontend controls.
- Admin login via OTP/Authenticator and forced faculty password changes are future requirements and must not be documented as currently working until implemented.

### 12.2 Core System Requirements
- The system must allow students to log in and submit borrowing requests.
- The system must show item availability in real time.
- The system must allow document upload during checkout.
- The system must allow faculty to approve or reject requests.
- The system must allow admin to override decisions.
- The system must update inventory quantity after item issue and return.
- The system must maintain borrowing history.
- The system must send return reminders.
- The system must track penalties.
- The system must provide separate dashboards for student, faculty, and admin.

## 13. Non-Functional Requirements

- Authentication secrets and database credentials must be stored in environment variables and excluded from version control.
- MongoDB must be reachable before the API server starts accepting requests.
- The web app should be responsive and usable on desktop, tablet, and mobile.
- The interface should be simple and easy to use.
- Pages should load quickly.
- Data should be backed up regularly.
- The system should support future labs if required.
- The system should support search and filtering.
- The system should maintain audit logs for sensitive actions.

## 14. Future Enhancements

- QR code scanning for item issue and return.
- Barcode-based inventory tracking.
- SMS or WhatsApp reminders.
- Online penalty payment.
- Faculty digital signature approval.
- Student ID card integration.
- Report generation in PDF or Excel.
- Analytics dashboard for lab usage.
- Maintenance schedule for lab equipment.

## 15. Acceptance Criteria

- A valid student or faculty account can authenticate using the matching role, email, and password.
- Invalid credentials return an authentication error and do not store a token.
- A successful login response contains a token and public user information without exposing the password hash.
- Protected API requests require a valid JWT.
- Student request history is scoped to the authenticated student.
- Inventory, borrowing requests, approvals, penalties, and document metadata persist in MongoDB.
- Seed and index initialization commands complete successfully against the configured MongoDB instance.
- The application does not depend on Sequelize or MySQL for runtime persistence.

## 16. Conclusion

This Inventory Management System will help Makers Lab 2 and Design IoT Lab manage borrowing, approvals, returns, reminders, and penalties in a structured digital way. It reduces manual paperwork, improves accountability, and provides clear visibility for students, faculty, and admin users.
