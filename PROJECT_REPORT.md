# Lab Inventory Management System
## Academic Project Report

**Submitted in partial fulfillment of the requirement for the award of the Degree of**  
**Bachelor of Technology in Computer Science and Engineering (Software Engineering)**  
**GSFC University, Vadodara**

---

### Project Metadata
* **Project Title**: Lab Inventory Management System (Makers Lab 2 & Design IoT Lab)
* **Faculty Mentor**: Ms. Yoothika Patel (Assistant Professor, School of Technology)
* **Submitted By**:
  * Harsh Shah (25BT04D251)
  * Maitrey Thanki
* **Institution**: School of Technology - Computer Science & Engineering, GSFC University, Vigyan Bhavan, P. O. Fertilizer Nagar, Vadodara - 391750, Gujarat, India
* **Date**: October - 2026

---

## Declaration
We, **Harsh Shah (25BT04D251)** and **Maitrey Thanki**, the undersigned, hereby declare that the project report entitled **"Lab Inventory Management System"** is our original work and has been carried out under the guidance of **Ms. Yoothika Patel**, faculty at **GSFC UNIVERSITY**. The report is being submitted in partial fulfillment of the requirements for the Bachelor of Technology in Computer Science and Engineering.

---

## Certificate
This is to certify that the report submitted along with the project entitled **"Lab Inventory Management System"** has been carried out by **Harsh Shah (25BT04D251)** and **Maitrey Thanki** under my guidance in partial fulfillment for the degree of Bachelor of Technology in Computer Science and Engineering – V Semester of GSFC University, Vadodara during the academic year 2026. The students have successfully completed the project activity under my guidance.

---

## Acknowledgement
We are extremely grateful and remain indebted to our honorable mentor and professor **Ms. Yoothika Patel** for being a continuous source of inspiration, guidance, and constructive support throughout the design, architecture, implementation, and evaluation of this project. Her valuable suggestions and feedback were critical in helping us successfully conceptualize and build the **Lab Inventory Management System**.

We also extend our sincere gratitude to the technical faculty in-charge of **Makers Lab 2** and **Design IoT Lab** for providing domain expertise, equipment data, and workflow requirements. Furthermore, we express our thanks to the administration and management of **GSFC University** for providing the lab facilities, computing infrastructure, and encouraging environment necessary to accomplish this project.

---

## Abstract
In typical academic institutions, engineering laboratories (such as Makers Lab 2 and Design IoT Lab) store and issue hundreds of valuable microcontrollers, sensors, computing boards, and measuring equipment. Traditionally, equipment borrowing, faculty approvals, and physical issuance are managed through manual paper slips and logbooks. This causes lack of real-time stock availability, prolonged approval delays, unmonitored overdue items, loss of permission slips, and heavy manual workload for lab in-charges.

This project delivers a centralized, automated web application designed to digitize the entire lab equipment borrowing lifecycle. It features role-based interfaces for Students, Faculty In-charge, and System Administrators. Students can browse live inventory by lab and category, submit borrow requests, and upload digital permission documents. Faculty members review applications, inspect uploaded slips, approve/reject requests, and confirm physical handover (decrementing stock) and returns (restoring stock). Administrators monitor all student records across both labs, override decisions with mandatory audit reasons, manage faculty accounts, and track overdue penalties.

Built on the MERN stack (React, Node.js, Express.js, MongoDB Atlas with Mongoose), the system features 6-digit TOTP two-factor authentication for administrators, automated background cron reminders for return deadlines and overdue notifications, and secure Multer file uploads. The system completely replaces paper-based lab records with an accountable, transparent digital solution.

---

# UML Diagrams & Architecture Code

### 1. Use Case Diagram (PlantUML & Mermaid)

#### PlantUML Code:
```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor Student
actor "Faculty In-Charge" as Faculty
actor "System Administrator" as Admin

rectangle "Lab Inventory Management System" {
  usecase "User Login & Registration" as UC_Login
  usecase "TOTP Authenticator Login" as UC_TOTP
  usecase "Browse Inventory by Lab" as UC_Browse
  usecase "Submit Requisition & Upload Slips" as UC_Checkout
  usecase "View Borrowing History & Status" as UC_History
  
  usecase "Review Pending Requests" as UC_Review
  usecase "Approve / Reject Requisitions" as UC_Decision
  usecase "Confirm Equipment Handover" as UC_Issue
  usecase "Verify Returns & Inspect Damage" as UC_Return
  
  usecase "Add / Edit Lab Equipment" as UC_ManageItems
  usecase "Override Faculty Decisions" as UC_Override
  usecase "Audit Override Log Trails" as UC_Audit
  usecase "Manage & Waive Penalties" as UC_Penalty
  usecase "Provision Faculty Accounts" as UC_FacultyAcc
}

Student --> UC_Login
Student --> UC_Browse
Student --> UC_Checkout
Student --> UC_History

Faculty --> UC_Login
Faculty --> UC_Review
Faculty --> UC_Decision
Faculty --> UC_Issue
Faculty --> UC_Return
Faculty --> UC_ManageItems

Admin --> UC_TOTP
Admin --> UC_Override
Admin --> UC_Audit
Admin --> UC_Penalty
Admin --> UC_FacultyAcc
Admin --> UC_ManageItems

UC_Issue ..> UC_Browse : <<decrements stock>>
UC_Return ..> UC_Browse : <<restores stock>>
UC_Return ..> UC_Penalty : <<assesses overdue/damage fee>>
@enduml
```

#### Mermaid Code:
```mermaid
graph LR
  subgraph Actors
    Student((Student))
    Faculty((Faculty In-Charge))
    Admin((System Administrator))
  end

  subgraph System["Lab Inventory Management System"]
    UC1[User Login & Registration]
    UC2[TOTP 6-digit Admin Login]
    UC3[Browse Inventory by Lab]
    UC4[Submit Checkout & Attach Docs]
    UC5[Track Request Status & History]
    UC6[Review Pending Approval Queue]
    UC7[Approve/Reject with Remarks]
    UC8[Issue Items - Decrement Stock]
    UC9[Confirm Return - Restore Stock]
    UC10[Override Decision with Audit Log]
    UC11[Manage Penalties & Dues]
    UC12[Provision Faculty Accounts]
  end

  Student --> UC1
  Student --> UC3
  Student --> UC4
  Student --> UC5

  Faculty --> UC1
  Faculty --> UC6
  Faculty --> UC7
  Faculty --> UC8
  Faculty --> UC9

  Admin --> UC2
  Admin --> UC10
  Admin --> UC11
  Admin --> UC12
  Admin --> UC8
  Admin --> UC9
```

---

### 2. Activity Diagram (Workflow)

#### Mermaid Code:
```mermaid
stateDiagram-v2
    [*] --> StudentLogin
    StudentLogin --> BrowseInventory: Filter by Makers Lab 2 or Design IoT Lab
    BrowseInventory --> SelectEquipment: Choose available item
    SelectEquipment --> Checkout: Specify return date, purpose & upload permission doc
    Checkout --> PendingApproval: Submit Requisition
    
    PendingApproval --> FacultyReview: Faculty opens Lab Approval Queue
    FacultyReview --> DecisionCheck
    
    state DecisionCheck <<choice>>
    DecisionCheck --> Rejected: Decision = Reject
    DecisionCheck --> Approved: Decision = Approve with Remarks
    
    Rejected --> StudentNotified: View rejection remarks
    StudentNotified --> [*]
    
    Approved --> PhysicalHandover: Student visits lab counter
    PhysicalHandover --> IssuedStatus: Faculty clicks 'Issue Equipment'
    note right of IssuedStatus: Stock quantity decremented automatically
    
    IssuedStatus --> InUse: Student conducts lab practicals
    InUse --> ReturnCheck
    
    state ReturnCheck <<choice>>
    ReturnCheck --> OnTimeReturn: Returned within deadline
    ReturnCheck --> LateReturn: Returned past due date
    
    LateReturn --> CalculatePenalty: Auto-compute daily late fees
    OnTimeReturn --> ConditionInspect: Check hardware condition
    CalculatePenalty --> ConditionInspect
    
    ConditionInspect --> StockRestored: Faculty clicks 'Confirm Return'
    note right of StockRestored: Stock quantity restored in MongoDB
    StockRestored --> [*]
```

---

### 3. Sequence Diagram (Requisition, Approval & Stock Handover)

#### Mermaid Code:
```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as React Client
    participant Auth as Auth Controller
    participant Req as Request Controller
    participant DB as MongoDB Atlas
    actor Faculty

    Student->>UI: Submit checkout (Item, Qty, Return Date, Docs)
    UI->>Req: POST /api/requests (Bearer JWT)
    Req->>DB: Check InventoryItem.availableQuantity >= Qty
    DB-->>Req: Stock confirmed
    Req->>DB: Create BorrowRequest (status: "pending")
    DB-->>Req: BorrowRequest saved
    Req-->>UI: 201 Created (Request #ID)
    UI-->>Student: Display "Request Submitted"

    Faculty->>UI: Open Faculty Dashboard
    UI->>Req: GET /api/requests?status=pending&labId=LabID
    Req->>DB: Find requests for assigned lab
    DB-->>Req: Requests list
    Req-->>UI: Render pending table & document links

    Faculty->>UI: Click "Approve" with remarks
    UI->>Req: PATCH /api/approvals/:id/decision
    Req->>DB: Update status = "approved", record approval log
    DB-->>Req: Updated
    Req-->>UI: Request Approved

    Student->>Faculty: Collect equipment physically at lab
    Faculty->>UI: Click "Issue Equipment"
    UI->>Req: POST /api/requests/:id/issue
    Req->>DB: Decrement InventoryItem.availableQuantity by Qty
    Req->>DB: Log ItemHistory (action: "borrow")
    Req->>DB: Update BorrowRequest status = "issued"
    DB-->>Req: Saved
    Req-->>UI: Items Issued & Stock Updated
```

---

### 4. Entity-Relationship (ER) Diagram

#### Mermaid Code:
```mermaid
erDiagram
    USER ||--o{ BORROW_REQUEST : submits
    USER ||--o{ APPROVAL_LOG : decides
    USER ||--o{ OVERRIDE_LOG : executes
    USER ||--o{ PENALTY : owes
    LAB ||--o{ INVENTORY_ITEM : houses
    LAB ||--o{ BORROW_REQUEST : fulfills
    BORROW_REQUEST ||--|{ REQUEST_ITEM : contains
    INVENTORY_ITEM ||--o{ REQUEST_ITEM : referenced_in
    INVENTORY_ITEM ||--o{ ITEM_HISTORY : audited_by
    BORROW_REQUEST ||--o{ PENALTY : incurs
    BORROW_REQUEST ||--o{ OVERRIDE_LOG : overridden_by

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string role "student | faculty | admin"
        string phone
        string enrollmentNumber
        string universityProgram
        string semester
        string division
        string residenceType "home | hostel"
        ObjectId assignedLabId FK
        string totpSecret
    }

    LAB {
        ObjectId _id PK
        string name UK "Makers Lab 2 | Design IoT Lab"
        string facultyInchargeName
        string facultyInchargeEmail
    }

    INVENTORY_ITEM {
        ObjectId _id PK
        string name
        string assetCode UK
        ObjectId labId FK
        string category
        int totalQuantity
        int availableQuantity
        string condition
        string status "available | unavailable | damaged"
        int borrowDurationDays
        string imageUrl
    }

    BORROW_REQUEST {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId labId FK
        date expectedBorrowDate
        date expectedReturnDate
        date actualReturnDate
        string purpose
        string status "pending | approved | issued | returned | overdue | cancelled"
        string facultyRemarks
        string adminRemarks
    }

    REQUEST_ITEM {
        ObjectId itemId FK
        string itemName
        int quantityRequested
        int quantityIssued
        string returnStatus
    }

    OVERRIDE_LOG {
        ObjectId _id PK
        ObjectId requestId FK
        ObjectId adminId FK
        string previousStatus
        string updatedStatus
        string reason
        date overrideDate
    }

    PENALTY {
        ObjectId _id PK
        ObjectId requestId FK
        ObjectId studentId FK
        ObjectId itemId FK
        string reason
        decimal amount
        string status "pending | paid | waived"
        string remarks
    }

    ITEM_HISTORY {
        ObjectId _id PK
        ObjectId itemId FK
        ObjectId requestId FK
        ObjectId studentId FK
        string action "borrow | return | quantity_update"
        int previousQuantity
        int updatedQuantity
        string remarks
    }
```

---

### 5. Data Flow Diagram (DFD Level 0 & Level 1)

#### Level 0 Context Diagram (Mermaid):
```mermaid
graph TD
  Student[Student] <-->|Requisitions, Document Upload, Returns| System((Lab Inventory Management System))
  Faculty[Faculty In-Charge] <-->|Approvals, Handover, Return Verification| System
  Admin[System Administrator] <-->|Overrides, Penalties, Account Provisioning| System
  System <-->|Storage & Queries| DB[(MongoDB Atlas Cloud)]
  System -->|Scheduled Alerts & Deadlines| EmailSystem[Nodemailer SMTP]
```

#### Level 1 DFD (Decomposition):
```mermaid
graph TD
  S[Student] -->|1. Credentials| P1[1.0 Auth & Profile Engine]
  P1 -->|Store User Details| D1[(Users Store)]
  
  S -->|2. Search & Filter| P2[2.0 Inventory Catalog Engine]
  P2 <-->|Fetch Available Equipment| D2[(Inventory Store)]
  
  S -->|3. Checkout + Attached Slip| P3[3.0 Requisition & File Manager]
  P3 -->|Store PDF/Images| Disk[(Server Uploads Directory)]
  P3 -->|Save Request| D3[(Borrow Requests Store)]
  
  F[Faculty] -->|4. Inspect Slips & Remarks| P4[4.0 Approval & Handover Controller]
  P4 <-->|Update Status| D3
  P4 -->|Decrement/Restore Stock| D2
  P4 -->|Write Audit Log| D4[(Item History Store)]
  
  A[Admin] -->|5. TOTP Code| P1
  A -->|6. Override Decision + Reason| P5[5.0 Governance & Override Engine]
  P5 -->|Update Request| D3
  P5 -->|Write Override Log| D5[(Override Logs Store)]
  
  Cron[Node-Cron Scheduler] -->|7. Daily Deadline Check| P6[6.0 Reminder & Penalty Engine]
  P6 <-->|Check Overdue Dates| D3
  P6 -->|Create Late Fee| D6[(Penalties Store)]
  P6 -->|Send Notification| Mail[Email Service]
```

---

## Guide for Inserting Screenshots in Chapter 3

When you open [`Lab_Inventory_Management_System_Project_Report.docx`](file:///C:/Users/Harsh/.gemini/antigravity-ide/scratch/AWTProject/Lab_Inventory_Management_System_Project_Report.docx) in Microsoft Word:

1. **Figure 6 (Login Page)**: Capture `http://localhost:5173/login` showing the Student Sign In and Student Sign Up tabs.
2. **Figure 7 (Admin Authenticator Login)**: Capture `http://localhost:5173/admin-login` showing the 6-digit TOTP input box.
3. **Figure 8 (Student Dashboard)**: Capture `http://localhost:5173/student` showing metric cards and borrowing history.
4. **Figure 9 (Inventory Browsing)**: Capture `http://localhost:5173/inventory` showing the Makers Lab 2 and Design IoT Lab tabs with stock meters.
5. **Figure 10 (Requisition Modal)**: Click "Request to Borrow" on any item to open the checkout modal with file upload.
6. **Figure 11 (Faculty Approval Dashboard)**: Log in as `faculty.makers@university.edu` and capture `http://localhost:5173/faculty`.
7. **Figure 12 (Admin Dashboard & Override)**: Log in as `admin@university.edu` (OTP: `123456`) and capture `http://localhost:5173/admin` with override audit logs.
8. **Figure 13 (Penalties Page)**: Capture `http://localhost:5173/penalties` showing outstanding dues and payment status.
