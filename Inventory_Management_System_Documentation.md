# Inventory Management System Web App Documentation

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

## 4.1 Student Side

### 4.1.1 Login Page

The student login page should collect the following details:

- Student name
- Enrollment number
- Semester
- Division
- Residence type:
  - Hostel
  - Home

Optional future fields:

- Email address
- Phone number
- Department
- ID card upload

The enrollment number should be used as the main unique identifier for each student.

### 4.1.2 Browsing Page

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

### 4.1.3 Cart and Checkout Page

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

## 4.2 Faculty Side

### 4.2.1 Faculty Dashboard

The faculty dashboard should show:

- Pending requests
- Approved requests
- Rejected requests
- Currently borrowed items
- Overdue items
- Inventory summary for assigned lab

### 4.2.2 Approval System

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

### 4.2.3 Inventory Management

Faculty should be able to manage inventory for their assigned lab.

Faculty inventory actions:

- View item availability.
- Update item quantity.
- Mark item condition.
- Mark item as unavailable.
- View item borrowing history.
- Confirm item return.
- Report damaged or missing items.

## 4.3 Admin Side

### 4.3.1 Admin Dashboard

The admin dashboard should provide a complete overview of both labs.

Dashboard sections:

- Total inventory items
- Available items
- Borrowed items
- Pending approvals
- Overdue returns
- Active penalties
- Recent borrowing activity

### 4.3.2 Student Borrowing List

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

### 4.3.3 Item History Tab

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

### 4.3.4 Document Review

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

### 4.3.5 Add Items System

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

### 4.3.6 Override System

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

## 8. Suggested Database Tables

### 8.1 Students

- student_id
- name
- enrollment_number
- semester
- division
- residence_type
- email
- phone
- created_at

### 8.2 Labs

- lab_id
- lab_name
- faculty_incharge_name
- faculty_incharge_email

### 8.3 InventoryItems

- item_id
- item_name
- asset_code
- lab_id
- category
- description
- total_quantity
- available_quantity
- condition
- status
- borrow_duration_days
- image_url
- created_at
- updated_at

### 8.4 BorrowRequests

- request_id
- student_id
- request_date
- expected_return_date
- actual_return_date
- purpose
- status
- faculty_remarks
- admin_remarks
- created_at
- updated_at

### 8.5 BorrowRequestItems

- request_item_id
- request_id
- item_id
- quantity_requested
- quantity_issued
- return_status

### 8.6 Documents

- document_id
- request_id
- uploaded_by
- file_name
- file_path
- file_type
- upload_date

### 8.7 Approvals

- approval_id
- request_id
- faculty_id
- decision
- remarks
- decision_date

### 8.8 Overrides

- override_id
- request_id
- admin_id
- previous_status
- updated_status
- reason
- override_date

### 8.9 Penalties

- penalty_id
- request_id
- student_id
- item_id
- penalty_reason
- amount
- status
- remarks
- created_at
- updated_at

### 8.10 ItemHistory

- history_id
- item_id
- request_id
- student_id
- action
- previous_quantity
- updated_quantity
- remarks
- created_at

## 9. Page List

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

## 10. Security Requirements

- Role-based access control must be implemented.
- Students should only access their own requests and records.
- Faculty should only access requests for assigned labs unless given extra permission.
- Admin should have full system access.
- Uploaded documents should be stored securely.
- Passwords must be encrypted.
- All approval and override actions must be logged.
- Important actions should require confirmation.

## 11. Functional Requirements

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

## 12. Non-Functional Requirements

- The web app should be responsive and usable on desktop, tablet, and mobile.
- The interface should be simple and easy to use.
- Pages should load quickly.
- Data should be backed up regularly.
- The system should support future labs if required.
- The system should support search and filtering.
- The system should maintain audit logs for sensitive actions.

## 13. Future Enhancements

- QR code scanning for item issue and return.
- Barcode-based inventory tracking.
- SMS or WhatsApp reminders.
- Online penalty payment.
- Faculty digital signature approval.
- Student ID card integration.
- Report generation in PDF or Excel.
- Analytics dashboard for lab usage.
- Maintenance schedule for lab equipment.

## 14. Conclusion

This Inventory Management System will help Makers Lab 2 and Design IoT Lab manage borrowing, approvals, returns, reminders, and penalties in a structured digital way. It reduces manual paperwork, improves accountability, and provides clear visibility for students, faculty, and admin users.
