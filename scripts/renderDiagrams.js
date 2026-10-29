import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const DIAGRAM_DIR = path.resolve("assets/diagrams");
fs.mkdirSync(DIAGRAM_DIR, { recursive: true });

const diagrams = [
  {
    name: "fig1_use_case.png",
    title: "Figure 1: Use Case Diagram",
    code: `graph LR
  subgraph Actors["Primary Actors"]
    Student["👤 Student"]
    Faculty["👨‍🏫 Faculty In-Charge"]
    Admin["🛡️ System Administrator"]
  end

  subgraph System["Lab Inventory Management System (Makers Lab 2 & Design IoT Lab)"]
    UC1["User Sign In & Student Registration"]
    UC2["6-Digit TOTP Two-Factor Authentication"]
    UC3["Browse Equipment Catalog by Lab & Category"]
    UC4["Submit Borrow Requisition & Attach Project Slips"]
    UC5["Track Borrowing Status & Active Due Dates"]
    UC6["Review Facility-Specific Pending Queue"]
    UC7["Approve / Reject Requisitions with Remarks"]
    UC8["Confirm Physical Handover (Stock Decrement)"]
    UC9["Inspect Condition & Verify Return (Stock Restore)"]
    UC10["Override Faculty Decisions with Mandatory Audit Reason"]
    UC11["Track Overdue Fines & Grant Waivers"]
    UC12["Provision Faculty Accounts & Initial Passwords"]
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
  Admin --> UC9`
  },
  {
    name: "fig2_activity.png",
    title: "Figure 2: Activity Diagram",
    code: `flowchart TD
    Start([● Start: Student Portal]) --> Login[Student Sign In / Registration]
    Login --> Browse[Browse Equipment by Makers Lab 2 / Design IoT Lab]
    Browse --> Select[Select Available Hardware Component]
    Select --> Checkout[Specify Qty, Return Date & Project Purpose]
    Checkout --> Upload[Upload Supporting Permission Letter / Slip]
    Upload --> Submit[Submit Borrow Requisition]
    
    Submit --> Review[Faculty Opens Facility Queue & Inspects Slip]
    Review --> Decision{Faculty Decision}
    
    Decision -- Rejected --> Notify[Student Notified with Rejection Remarks]
    Notify --> FinishReject([● End: Requisition Closed])
    
    Decision -- Approved --> Handover[Student Arrives at Lab Counter for Collection]
    Handover --> IssueAction[Faculty Clicks 'Issue Equipment']
    IssueAction --> DecStock[(Stock Decremented in Database)]
    DecStock --> ActiveUse[Student Uses Component in Labs / Projects]
    
    ActiveUse --> ReturnCheck{Returned On or Before Due Date?}
    
    ReturnCheck -- No: Past Deadline --> Penalty[Penalty Engine Computes Daily Late Fees]
    ReturnCheck -- Yes: On Time --> Inspection[Faculty Inspects Physical & Electrical Condition]
    Penalty --> Inspection
    
    Inspection --> ReturnAction[Faculty Clicks 'Confirm Return']
    ReturnAction --> IncStock[(Stock Restored in Database)]
    IncStock --> Audit[Item History Audit Logged]
    Audit --> FinishSuccess([● End: Item Restored to Inventory])`
  },
  {
    name: "fig3_sequence.png",
    title: "Figure 3: Sequence Diagram",
    code: `sequenceDiagram
    autonumber
    actor Student
    participant UI as React Client Application
    participant Req as Borrow Request Service
    participant DB as MongoDB Atlas Database
    actor Faculty
    participant Cron as Reminder Cron Engine

    Student->>UI: Submit checkout (Item, Qty, Return Date, Permission Slip)
    UI->>Req: POST /api/requests (Bearer JWT + Multipart Form)
    Req->>DB: Check InventoryItem.availableQuantity >= Requested Qty
    DB-->>Req: Stock Available & Validated
    Req->>DB: Insert BorrowRequest (status: 'pending')
    DB-->>Req: Saved (Request ID)
    Req-->>UI: 201 Created & Request Number
    UI-->>Student: Display Submission Confirmation

    Faculty->>UI: Open Faculty Dashboard for Assigned Lab
    UI->>Req: GET /api/requests?status=pending&labId=LabID
    Req->>DB: Query pending requisitions for facility
    DB-->>Req: List of pending requests & applicant details
    Req-->>UI: Render Pending Queue & Attached Docs

    Faculty->>UI: Review & Click 'Approve' with Remarks
    UI->>Req: PATCH /api/approvals/:id/decision (status: 'approved')
    Req->>DB: Update status='approved', record approval timestamp & remarks
    DB-->>Req: Success
    Req-->>UI: Approval Confirmed

    Student->>Faculty: Visit lab counter for physical component collection
    Faculty->>UI: Click 'Issue Equipment'
    UI->>Req: POST /api/requests/:id/issue
    Req->>DB: Decrement InventoryItem.availableQuantity by Qty
    Req->>DB: Record ItemHistory (action: 'borrow', previousQty, newQty)
    Req->>DB: Update BorrowRequest status='issued', actualBorrowDate=Now
    DB-->>Req: Inventory & Requisition Updated
    Req-->>UI: Issuance Recorded & Stock Synchronized

    Cron->>DB: Scan requests due in 2 days / due today / overdue
    Cron->>DB: Mark status='overdue' & calculate daily penalties`
  },
  {
    name: "fig4_er_diagram.png",
    title: "Figure 4: Entity-Relationship Diagram",
    code: `erDiagram
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
        ObjectId id PK
        string name
        string email
        string passwordHash
        string role
        string phone
        string enrollmentNumber
        string universityProgram
        string semester
        string division
        string residenceType
        ObjectId assignedLabId FK
        string totpSecret
    }

    LAB {
        ObjectId id PK
        string name
        string facultyInchargeName
        string facultyInchargeEmail
    }

    INVENTORY_ITEM {
        ObjectId id PK
        string name
        string assetCode
        ObjectId labId FK
        string category
        int totalQuantity
        int availableQuantity
        string condition
        string status
        int borrowDurationDays
        string imageUrl
    }

    BORROW_REQUEST {
        ObjectId id PK
        ObjectId studentId FK
        ObjectId labId FK
        date expectedBorrowDate
        date expectedReturnDate
        date actualReturnDate
        string purpose
        string status
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
        ObjectId id PK
        ObjectId requestId FK
        ObjectId adminId FK
        string previousStatus
        string updatedStatus
        string reason
        date overrideDate
    }

    PENALTY {
        ObjectId id PK
        ObjectId requestId FK
        ObjectId studentId FK
        ObjectId itemId FK
        string reason
        decimal amount
        string status
        string remarks
    }

    ITEM_HISTORY {
        ObjectId id PK
        ObjectId itemId FK
        ObjectId requestId FK
        ObjectId studentId FK
        string action
        int previousQuantity
        int updatedQuantity
        string remarks
    }`
  },
  {
    name: "fig5_dfd_level0.png",
    title: "Figure 5: Data Flow Diagram Level 0 Context Diagram",
    code: `graph TD
  Student["👤 Student Entity"] <-->|Requisition Form, Project Permission Slip, Return Intimation| System(("⚙️ Lab Inventory Management System (Process 0)"))
  Faculty["👨‍🏫 Faculty In-Charge"] <-->|Application Reviews, Issue Approvals, Return Inspections| System
  Admin["🛡️ System Administrator"] <-->|Decision Overrides, Faculty Provisioning, Penalty Settlements| System
  System <-->|Read / Write Users, Inventory, Requests, Overrides, Penalties| DB[("🗄️ MongoDB Atlas Cloud Database")]
  System -->|Automated Due Date Reminders & Overdue Alerts| SMTP["📧 Email Notification Service (SMTP)"]`
  },
  {
    name: "fig6_dfd_level1.png",
    title: "Figure 6: Data Flow Diagram Level 1 Functional Decomposition",
    code: `flowchart TD
  subgraph ExtEntities["External Entities"]
    S["👤 Student"]
    F["👨‍🏫 Faculty In-Charge"]
    A["🛡️ System Admin"]
    Scheduler["⏰ Node-Cron Service"]
  end

  subgraph CoreProcesses["System Processing Engines"]
    P1["1.0 Auth & Profile Engine"]
    P2["2.0 Inventory Catalog Engine"]
    P3["3.0 Requisition & File Manager"]
    P4["4.0 Approval & Handover Controller"]
    P5["5.0 Governance & Override Engine"]
    P6["6.0 Deadline & Penalty Assessment"]
  end

  subgraph DataStores["Data Stores (MongoDB Atlas & Storage)"]
    D1[("D1: Users Store")]
    D2[("D2: Inventory Store")]
    Disk[("D3: File Uploads Disk")]
    D4[("D4: Borrow Requests Store")]
    D5[("D5: Item History Store")]
    D6[("D6: Override Logs Store")]
    D7[("D7: Penalties Store")]
  end

  S -->|Sign In / Reg| P1
  P1 <-->|User Profile| D1

  S -->|Search Equipment| P2
  P2 <-->|Query Stock| D2

  S -->|Submit Cart & Slip| P3
  P3 -->|Store Letters| Disk
  P3 -->|Create Request| D4

  F -->|Inspect & Approve| P4
  P4 <-->|Update Status| D4
  P4 -->|Adjust Stock| D2
  P4 -->|Audit History| D5

  A -->|TOTP Login| P1
  A -->|Override Decision| P5
  P5 <-->|Modify Status| D4
  P5 -->|Audit Record| D6

  Scheduler -->|Daily Check| P6
  P6 <-->|Scan Deadlines| D4
  P6 -->|Compute Fines| D7`
  },
  {
    name: "fig7_architecture.png",
    title: "Figure 7: System Architecture Diagram",
    code: `flowchart TB
  subgraph PresentationTier["1. Presentation Tier (Client SPA)"]
    direction LR
    StudentUI["Student Portal (React + Vite)"]
    FacultyUI["Faculty Console (React + Vite)"]
    AdminUI["Admin Governance (React + Vite)"]
  end

  subgraph LogicTier["2. Business Logic & Application Tier (Node.js & Express.js)"]
    direction TB
    Router["API Gateway / Express Router (/api/*)"]
    AuthMW["JWT & TOTP Auth Middleware"]
    MulterMW["Multer File Upload Validator (PDF/Img)"]
    
    subgraph Controllers["REST Controllers"]
      AuthCtrl["Auth Controller"]
      InvCtrl["Inventory Controller"]
      ReqCtrl["Request Controller"]
      ApprCtrl["Approval Controller"]
      GovCtrl["Override Controller"]
      PenCtrl["Penalty Controller"]
    end
    
    CronSvc["Node-Cron Background Scheduler (Daily Sweep)"]
  end

  subgraph DataTier["3. Data Persistence Tier (MongoDB Atlas Cloud)"]
    direction LR
    Mongoose["Mongoose ODM Engine"]
    MongoCloud[("MongoDB Atlas Cloud Database")]
    FileStorage[("Server Uploads Directory (/uploads/*)")]
  end

  PresentationTier -->|HTTP REST / JSON / Bearer JWT| Router
  Router --> AuthMW
  Router --> MulterMW
  AuthMW --> Controllers
  MulterMW --> Controllers
  Controllers --> Mongoose
  CronSvc --> Mongoose
  Mongoose --> MongoCloud
  MulterMW --> FileStorage`
  }
];

const templateHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 24px;
      background: #FFFFFF;
      font-family: 'Segoe UI', Calibri, sans-serif;
      display: inline-block;
    }
    #container {
      background: #FFFFFF;
      padding: 20px;
      border: 1px solid #E8DFD8;
      border-radius: 8px;
    }
    svg {
      max-width: 100% !important;
      height: auto !important;
    }
  </style>
</head>
<body>
  <div id="container"></div>
  <script>
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      themeVariables: {
        primaryColor: '#F5EBE1',
        primaryTextColor: '#2C1D11',
        primaryBorderColor: '#634028',
        lineColor: '#5C381E',
        secondaryColor: '#EADBC8',
        tertiaryColor: '#FFFFFF',
        fontFamily: 'Segoe UI, Calibri, sans-serif'
      }
    });
  </script>
</body>
</html>`;

async function render() {
  console.log("Launching headless browser to render UML and Architecture diagrams...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000, deviceScaleFactor: 2 });
  page.on("console", msg => console.log("PAGE LOG:", msg.text()));
  page.on("pageerror", err => console.error("PAGE ERROR:", err));

  await page.setContent(templateHtml, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof window.mermaid !== "undefined", { timeout: 15000 });
  console.log("Mermaid library loaded successfully.");

  let counter = 0;
  for (const diag of diagrams) {
    counter++;
    console.log(`Rendering (${counter}/${diagrams.length}) ${diag.title}...`);
    const id = `diag_${counter}`;
    const result = await page.evaluate(async (diagId, code) => {
      const container = document.getElementById("container");
      container.innerHTML = "";
      try {
        const { svg } = await window.mermaid.render(diagId, code);
        container.innerHTML = svg;
        return { success: true };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }, id, diag.code);

    if (result.success) {
      await new Promise(r => setTimeout(r, 200));
      const element = await page.$("#container");
      const outPath = path.join(DIAGRAM_DIR, diag.name);
      await element.screenshot({ path: outPath });
      console.log(`Saved: ${outPath}`);
    } else {
      console.error(`Failed rendering ${diag.title}: ${result.error}`);
    }
  }

  await browser.close();
  console.log("All diagram renderings completed!");
}

render().catch(console.error);
