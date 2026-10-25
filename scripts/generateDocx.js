import fs from "fs";
import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer
} from "docx";

function createReportDocument() {
  const pageBreak = () => new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true });

  const heading1 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 200 },
      children: [new TextRun({ text, bold: true, size: 32, font: "Calibri", color: "2C1D11" })]
    });

  const heading2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 120 },
      children: [new TextRun({ text, bold: true, size: 26, font: "Calibri", color: "5C381E" })]
    });

  const heading3 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 160, after: 80 },
      children: [new TextRun({ text, bold: true, size: 22, font: "Calibri", color: "333333" })]
    });

  const p = (text, options = {}) =>
    new Paragraph({
      alignment: options.align || AlignmentType.JUSTIFIED,
      spacing: { after: 140, line: 320 },
      children: [
        new TextRun({
          text,
          size: 24, // 12pt
          font: "Calibri",
          bold: options.bold || false,
          italics: options.italics || false,
          color: options.color || "222222"
        })
      ]
    });

  const bullet = (text, prefix = "• ") =>
    new Paragraph({
      spacing: { after: 80, line: 280 },
      indent: { left: 400 },
      children: [
        new TextRun({ text: prefix, bold: true, size: 24, font: "Calibri", color: "5C381E" }),
        new TextRun({ text, size: 24, font: "Calibri", color: "222222" })
      ]
    });

  const diagramPlaceholder = (title, hint) =>
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 200 },
      children: [
        new TextRun({ text: `[INSERT IMAGE: ${title}]`, bold: true, size: 24, color: "8D2F1E", font: "Calibri" }),
        new TextRun({ text: `\n(${hint})`, italics: true, size: 20, color: "666666", font: "Calibri" })
      ]
    });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // ==================== PAGE 1: TITLE PAGE ====================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 140 },
            children: [
              new TextRun({
                text: "Lab Inventory Management System",
                bold: true,
                size: 40,
                font: "Calibri",
                color: "2C1D11"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
            children: [
              new TextRun({
                text: "A Project Report\nSubmitted\nIn partial fulfillment of the requirement for the award of\nthe Degree of\nBachelor of Technology in\nComputer Science and Engineering (Software Engineering)",
                size: 24,
                italics: true,
                font: "Calibri"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 300 },
            children: [
              new TextRun({
                text: "[ GSFC UNIVERSITY LOGO ]\nGSFC UNIVERSITY\nEDUCATION RE-ENVISIONED",
                bold: true,
                size: 26,
                font: "Calibri",
                color: "5C381E"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 200 },
            children: [
              new TextRun({
                text: "Faculty Mentor: Ms. Yoothika Patel",
                bold: true,
                size: 24,
                font: "Calibri"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: "Submitted by:\nHarsh Shah (25BT04D251)\nMaitrey Thanki",
                bold: true,
                size: 24,
                font: "Calibri"
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 80 },
            children: [
              new TextRun({
                text: "School of Technology - Computer Science & Engineering\nGSFC University,\nVigyan Bhavan, P. O. Fertilizer Nagar,\nVadodara - 391750, Gujarat, India\n\nOctober - 2026",
                bold: true,
                size: 22,
                font: "Calibri"
              })
            ]
          }),

          // ==================== PAGE 2: DECLARATION ====================
          pageBreak(),
          heading1("Declaration"),
          p(
            "We, Harsh Shah (25BT04D251) and Maitrey Thanki, the undersigned, hereby declare that the project report entitled \"Lab Inventory Management System\" is our original work and has been carried out under the guidance of Ms. Yoothika Patel, faculty at GSFC UNIVERSITY. The report is being submitted in partial fulfillment of the requirements for the Bachelor of Technology in Computer Science and Engineering."
          ),
          new Paragraph({ spacing: { before: 800 } }),
          p("Signature:\n\n___________________________\nHarsh Shah (25BT04D251)", { bold: true }),
          new Paragraph({ spacing: { before: 400 } }),
          p("___________________________\nMaitrey Thanki", { bold: true }),

          // ==================== PAGE 3: CERTIFICATE ====================
          pageBreak(),
          heading1("CERTIFICATE"),
          p(
            "This is to certify that the report submitted along with the project entitled \"Lab Inventory Management System\" has been carried out by Harsh Shah (25BT04D251) and Maitrey Thanki under my guidance in partial fulfillment for the degree of Bachelor of Technology in Computer Science and Engineering – V Semester of GSFC University, Vadodara during the academic year 2026. The students have successfully completed the project activity under my guidance."
          ),
          new Paragraph({ spacing: { before: 900 } }),
          p("Signature of Faculty Mentor:\n\n___________________________\nMs. Yoothika Patel\nAssistant Professor, School of Technology\nGSFC University, Vadodara", { bold: true }),

          // ==================== PAGE 4: ACKNOWLEDGEMENT ====================
          pageBreak(),
          heading1("ACKNOWLEDGEMENT"),
          p(
            "We are extremely grateful and remain indebted to our honorable mentor and professor Ms. Yoothika Patel for being a continuous source of inspiration, guidance, and constructive support throughout the design, architecture, implementation, and evaluation of this project. Her valuable suggestions and feedback were critical in helping us successfully conceptualize and build the \"Lab Inventory Management System\"."
          ),
          p(
            "We also extend our sincere gratitude to the technical faculty in-charge of Makers Lab 2 and Design IoT Lab for providing domain expertise, equipment data, and workflow requirements. Furthermore, we express our thanks to the administration and management of GSFC University for providing the lab facilities, computing infrastructure, and encouraging environment necessary to accomplish this project."
          ),
          p(
            "Finally, we thank our classmates and peer reviewers who offered constructive feedback on our user interface design and testing scenarios. Their inputs helped elevate the quality, usability, and robustness of the system."
          ),
          new Paragraph({ spacing: { before: 400 } }),
          p("With Regards,\nHarsh Shah & Maitrey Thanki", { bold: true }),

          // ==================== PAGE 5: ABSTRACT ====================
          pageBreak(),
          heading1("Abstract"),
          p(
            "In modern academic institutions, advanced engineering laboratories—such as Makers Lab 2 and Design IoT Lab—house thousands of valuable computing boards, microcontrollers, sensors, communication modules, and precision measuring instruments. Traditionally, student equipment requisitions, approvals, and physical issuance are managed through manual paper slips, handwritten logbooks, and fragmented email exchanges. This conventional workflow causes significant administrative friction: equipment availability cannot be verified in real time, requests suffer prolonged approval delays, overdue returns remain unmonitored, paper permission slips frequently get lost, and faculty members carry an overwhelming tracking burden."
          ),
          p(
            "To resolve these operational bottlenecks, this project presents the Lab Inventory Management System—a modern, full-stack web application designed to digitize, automate, and centralize the entire lab equipment borrowing lifecycle. The system provides role-based workspaces for Students, Faculty In-charge, and System Administrators. Students can browse real-time inventory filtered by lab and category, submit borrow requests, and upload digital permission documents. Faculty members review applications, inspect uploaded slips, set approved return dates, and confirm equipment handover with automatic inventory stock decrementing. Administrators oversee campus-wide inventory, monitor student borrowing histories, apply decision overrides with mandatory audit logging, and track overdue penalties."
          ),
          p(
            "The system is built on a high-performance MERN architecture utilizing React (Vite) and responsive Vanilla CSS for the presentation layer, Express.js and Node.js for RESTful micro-services, and MongoDB Atlas with Mongoose for persistent document storage. Key technical innovations include Time-Based One-Time Password (TOTP) authenticator login for administrators, automated background cron reminders for return deadlines and overdue notifications, and Multer-powered document validation. The resulting platform eliminates manual paperwork, enforces total accountability, and ensures high availability of university lab assets."
          ),

          // ==================== PAGE 6-7: LIST OF FIGURES ====================
          pageBreak(),
          heading1("LIST OF FIGURES"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [p("Figure No.", { bold: true })] }),
                  new TableCell({ children: [p("Figure Title / Description", { bold: true })] }),
                  new TableCell({ children: [p("Page No.", { bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("1")] }),
                  new TableCell({ children: [p("Use Case Diagram (Student, Faculty, Admin Actor Interactions)")] }),
                  new TableCell({ children: [p("22")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("2")] }),
                  new TableCell({ children: [p("Activity Diagram (Equipment Requisition, Approval & Return Workflow)")] }),
                  new TableCell({ children: [p("23")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("3")] }),
                  new TableCell({ children: [p("Sequence Diagram (Checkout, Approval, Stock Deduction & Handover)")] }),
                  new TableCell({ children: [p("24")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("4")] }),
                  new TableCell({ children: [p("Entity-Relationship (ER) Diagram / MongoDB Document Schema Model)")] }),
                  new TableCell({ children: [p("25")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("5")] }),
                  new TableCell({ children: [p("Data Flow Diagram (DFD Level 0 Context & Level 1 Decomposition)")] }),
                  new TableCell({ children: [p("26")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("6")] }),
                  new TableCell({ children: [p("Unified Student & Faculty Login and Student Sign-Up Interface")] }),
                  new TableCell({ children: [p("27")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("7")] }),
                  new TableCell({ children: [p("Administrator Authenticator (6-digit TOTP) Login Portal")] }),
                  new TableCell({ children: [p("28")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("8")] }),
                  new TableCell({ children: [p("Student Dashboard with Active Metrics & Borrowing History")] }),
                  new TableCell({ children: [p("29")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("9")] }),
                  new TableCell({ children: [p("Lab Equipment Inventory Catalog with Availability Progress Meters")] }),
                  new TableCell({ children: [p("30")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("10")] }),
                  new TableCell({ children: [p("Requisition & Document Upload Checkout Modal")] }),
                  new TableCell({ children: [p("31")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("11")] }),
                  new TableCell({ children: [p("Faculty Approval Dashboard, Handover & Return Verification")] }),
                  new TableCell({ children: [p("32")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("12")] }),
                  new TableCell({ children: [p("Administrator Decision Override Panel & Audit Trail Log")] }),
                  new TableCell({ children: [p("33")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("13")] }),
                  new TableCell({ children: [p("Penalties & Overdue Violation Management Interface")] }),
                  new TableCell({ children: [p("34")] })
                ]
              })
            ]
          }),

          // ==================== PAGE 8: TABLE OF CONTENTS ====================
          pageBreak(),
          heading1("TABLE OF CONTENTS"),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter / Section", { bold: true })] }),
                  new TableCell({ children: [p("Title", { bold: true })] }),
                  new TableCell({ children: [p("Page No.", { bold: true })] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("1")] }),
                  new TableCell({ children: [p("Title Page")] }),
                  new TableCell({ children: [p("1")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("2")] }),
                  new TableCell({ children: [p("Declaration")] }),
                  new TableCell({ children: [p("2")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("3")] }),
                  new TableCell({ children: [p("Certificate")] }),
                  new TableCell({ children: [p("3")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("4")] }),
                  new TableCell({ children: [p("Acknowledgement")] }),
                  new TableCell({ children: [p("4")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("5")] }),
                  new TableCell({ children: [p("Abstract")] }),
                  new TableCell({ children: [p("5")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("6")] }),
                  new TableCell({ children: [p("List of Figures")] }),
                  new TableCell({ children: [p("6")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("7")] }),
                  new TableCell({ children: [p("Table of Content")] }),
                  new TableCell({ children: [p("8")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter 1")] }),
                  new TableCell({ children: [p("Introduction to Project (Overview, Objectives, Scope, Modules)")] }),
                  new TableCell({ children: [p("9")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter 2")] }),
                  new TableCell({ children: [p("System Analysis and Design (UML, Requirements, ER, DFD)")] }),
                  new TableCell({ children: [p("15")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter 3")] }),
                  new TableCell({ children: [p("Implementation of Project (Screenshots & System Modules)")] }),
                  new TableCell({ children: [p("27")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter 4")] }),
                  new TableCell({ children: [p("Observations (Problems Encountered & Lessons Learned)")] }),
                  new TableCell({ children: [p("35")] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [p("Chapter 5")] }),
                  new TableCell({ children: [p("Conclusion & Future Enhancement (Achievements & Roadmap)")] }),
                  new TableCell({ children: [p("37")] })
                ]
              })
            ]
          }),

          // ==================== CHAPTER 1: INTRODUCTION ====================
          pageBreak(),
          heading1("Chapter: 1 Introduction to Project"),
          heading2("1.1 Overview"),
          p(
            "Managing laboratory equipment and inventories in modern university environments—particularly within specialized technical spaces like Makers Lab 2 and Design IoT Lab—is a demanding and complex administrative responsibility. Engineering students constantly require microcontrollers (such as Arduino Uno, ESP32, and Raspberry Pi), sensor expansion modules, communication transceivers (LoRa, Bluetooth), soldering equipment, and precision measuring devices (Digital Multimeters, Oscilloscopes) for coursework practicals, hackathons, and capstone projects."
          ),
          p(
            "In conventional university operations, equipment issuance is conducted manually. Students physically visit the laboratory, search through paper registries, wait for faculty signatures, and hand over physical paper request slips. This manual approach suffers from critical deficiencies: students cannot check whether an item is currently available in stock before traveling to the lab; faculty members cannot easily verify previous student borrowing history or unpaid penalties; paper slips get misplaced, leading to unaccounted equipment loss; and return deadlines are consistently missed because there is no automated reminder mechanism."
          ),
          p(
            "The Lab Inventory Management System addresses these challenges by transforming the physical paper-based workflow into an automated, transparent, and resilient full-stack web application. The software provides real-time stock visibility across laboratories, digitizes request submissions and document approvals, enforces stock decrementing and incrementing upon physical handover and return, executes administrative decision overrides, and issues automated return reminders."
          ),

          heading2("1.2 Project Objective"),
          p(
            "The primary objective of this project is to develop a reliable, secure, and user-friendly digital platform to automate the entire equipment borrowing and inventory control workflow for university laboratories. Key objectives include:"
          ),
          bullet("Provide real-time inventory visibility so students can check stock levels before applying."),
          bullet("Digitize the requisition process, allowing students to submit purpose details, expected return dates, and required approval slips online."),
          bullet("Empower faculty members with an intuitive approval queue to review student profiles, inspect attached permission letters, approve or reject requisitions, and adjust return deadlines."),
          bullet("Automate stock synchronization by automatically reducing available quantities upon item issuance and restoring inventory upon return."),
          bullet("Implement an administrative governance system allowing super-users to override decisions, audit borrowing records across all labs, and maintain accountability logs."),
          bullet("Establish an automated return reminder mechanism via background cron jobs to prevent overdue delays and calculate late/damage penalties."),

          heading2("1.3 Scope of the Project"),
          p(
            "The scope of this project encompasses laboratory inventory management across Makers Lab 2 and Design IoT Lab at GSFC University. The system is designed to overcome specific operational constraints:"
          ),
          bullet("Time Constraints: Eliminates physical queuing and manual register lookups by allowing students to browse and apply online 24/7."),
          bullet("Performance Constraints: Uses indexed MongoDB queries to ensure sub-second response times during peak lab registration hours."),
          bullet("Security & Governance Constraints: Implements role-based access control (RBAC), password hashing with bcryptjs, and Google Authenticator TOTP verification for administrative privileges."),

          heading2("1.4 System Architecture Modules"),
          p("The software architecture is structured into five core functional modules:"),
          bullet("User Management Module: Handles student sign-up, academic profile validation, faculty account provisioning, password updates, and secure JWT authentication."),
          bullet("Inventory Management Module: Catalogs laboratory assets by lab facility, category, asset code, condition, and tracks live availability percentages."),
          bullet("Requisition & Lifecycle Module: Manages checkout submissions, document attachments, faculty approvals, physical equipment issuance, and stock deduction/restoration."),
          bullet("Administrative Governance & Override Module: Enables super-users to view campus-wide audit trails, inspect uploaded slips, manage faculty accounts, and override decisions with mandatory justifications."),
          bullet("Penalty & Reminder Module: Features background cron jobs that calculate overdue fees, monitor upcoming return deadlines, send email notifications, and track payment/waiver statuses."),

          // ==================== CHAPTER 2: SYSTEM ANALYSIS AND DESIGN ====================
          pageBreak(),
          heading1("Chapter: 2 System Analysis and Design"),
          heading2("2.1 Disadvantages of Manual Process"),
          bullet("Labor-Intensive: Faculty and lab assistants spend hours manually writing log entries and verifying paper receipts."),
          bullet("Zero Real-Time Stock Visibility: Students have no way of knowing whether an item is available without visiting the lab in person."),
          bullet("High Rate of Asset Loss: Without centralized digital tracking, borrowed equipment frequently goes unreturned without accountability."),
          bullet("Delayed Approvals: Student projects are held up waiting for physical in-person faculty signatures."),
          bullet("Paper Waste & Misplaced Documents: Physical approval letters and project permission slips are prone to wear, damage, or loss."),
          bullet("Absence of Automated Alerts: Overdue items are difficult to track, leading to lack of equipment for incoming students."),

          heading2("2.2 Proposed System & Benefits"),
          p(
            "The proposed web application centralizes inventory tracking, digitizes student requests, automates approval workflows, and secures administrative oversight. Key benefits include:"
          ),
          bullet("100% Paperless Requisition Workflow: All applications and supporting letters are stored digitally."),
          bullet("Real-Time Stock Synchronization: Inventory meters automatically update as equipment is issued or returned."),
          bullet("Multi-Role Access Control: Distinct interfaces tailored for Students, Faculty In-charge, and System Administrators."),
          bullet("Enhanced Security: Industry-standard JWT authentication and 6-digit TOTP two-factor verification for administrators."),
          bullet("Complete Auditability: Every approval, rejection, and override action is permanently recorded in historical logs."),

          heading2("2.3 Requirements Gathering Methods"),
          bullet("Interviews: Consulted lab assistants and faculty mentors of Makers Lab 2 and Design IoT Lab to map the exact borrowing workflow."),
          bullet("Questionnaires: Gathered feedback from engineering students regarding lab booking pain points and turnaround times."),
          bullet("Document Analysis: Inspected existing paper registers, logbooks, and project permission forms to design the database schema."),
          bullet("Prototyping: Iteratively reviewed UI wireframes with faculty to ensure compliance with university guidelines."),

          heading2("2.4 Functional Requirements"),
          bullet("FR1 (Authentication): Secure registration and login for students, faculty authentication, and TOTP verification for admins."),
          bullet("FR2 (Inventory Browsing): Tabbed catalog filtering by lab (Makers Lab 2 vs. Design IoT Lab), category, and live stock."),
          bullet("FR3 (Requisition Submission): Multi-item cart checkout with return dates, purpose statement, and document upload."),
          bullet("FR4 (Faculty Approval Queue): Facility-specific review of student applications with approve/reject actions and remarks."),
          bullet("FR5 (Stock Control): Automatic stock decrement on physical item issue and stock restoration upon return."),
          bullet("FR6 (Admin Overrides): Super-user ability to reverse decisions or extend deadlines with mandatory audit reasons."),
          bullet("FR7 (Penalty Engine): Automatic calculation of daily overdue charges and recording of damage/loss compensation."),
          bullet("FR8 (Automated Reminders): Daily cron scheduler issuing notifications 2 days prior to, on the day of, and after due dates."),

          heading2("2.5 Nonfunctional Requirements"),
          bullet("Usability: Clean, modern, earthy color palette with intuitive navigation and responsive design for mobile and desktop."),
          bullet("Availability & Reliability: Hosted with high-availability MongoDB Atlas cloud database ensuring 99.9% uptime."),
          bullet("Security: Bcrypt password hashing (10 salt rounds), authenticated file downloads, and parameter sanitization."),
          bullet("Performance: Sub-second query execution through indexed MongoDB collections (`studentId`, `labId`, `assetCode`, `status`)."),

          heading2("2.6 UML Diagrams & System Modeling"),
          p("To formally represent the architecture, behavior, and data flow of the system, five standard UML modeling diagrams were constructed:"),

          heading3("2.6.1 Use Case Diagram"),
          p("Depicts the interactions between the primary external actors (Student, Faculty In-Charge, System Administrator) and the functional boundaries of the system."),
          diagramPlaceholder("Figure 1: Use Case Diagram", "Insert exported Use Case diagram image here"),

          heading3("2.6.2 Activity Diagram"),
          p("Models the chronological business workflow from student item search, cart requisition, document attachment, faculty decision, physical issuance, and return verification."),
          diagramPlaceholder("Figure 2: Activity Diagram", "Insert exported Activity Diagram image here"),

          heading3("2.6.3 Sequence Diagram"),
          p("Illustrates the time-ordered message exchange between Client UI, Authentication Controller, Request Service, and MongoDB Database during checkout and approval."),
          diagramPlaceholder("Figure 3: Sequence Diagram", "Insert exported Sequence Diagram image here"),

          heading3("2.6.4 Entity-Relationship (ER) Diagram"),
          p("Represents the logical data model, document collections, embedded sub-documents, and ObjectId references across Users, Labs, InventoryItems, BorrowRequests, OverrideLogs, and Penalties."),
          diagramPlaceholder("Figure 4: ER Diagram", "Insert exported ER Diagram image here"),

          heading3("2.6.5 Data Flow Diagram (DFD Level 0 & Level 1)"),
          p("Depicts the flow of data across system boundaries, transformations through functional controllers, and persistence into MongoDB storage collections."),
          diagramPlaceholder("Figure 5: Data Flow Diagram", "Insert exported DFD diagram image here"),

          // ==================== CHAPTER 3: IMPLEMENTATION ====================
          pageBreak(),
          heading1("Chapter: 3 Implementation of Project"),
          p("This chapter presents the user interfaces, page workflows, and operational capabilities implemented across the front-end and back-end stacks."),

          heading2("3.1 Unified Login & Student Registration Interface"),
          p("Provides a unified sign-in portal for Students and Faculty, along with a full Student Registration tab collecting student name, university email, phone number, program, semester, division, stay type, and encrypted password."),
          diagramPlaceholder("Figure 6: Login & Student Registration Page", "Insert screenshot of /login page"),

          heading2("3.2 Administrator Authenticator (TOTP) Portal"),
          p("Implements a secure administrative gateway requiring university admin credentials and a live 6-digit Time-Based One-Time Password generated from an authenticator app (Google Authenticator / Microsoft Authenticator)."),
          diagramPlaceholder("Figure 7: Administrator TOTP Login Page", "Insert screenshot of /admin-login page"),

          heading2("3.3 Student Dashboard & Borrowing History"),
          p("Displays real-time student metrics (Active Requests, Approved Items, Due Soon, Penalties Due) aggregated directly from MongoDB, alongside complete borrowing records and a 'Get Again' quick re-order action."),
          diagramPlaceholder("Figure 8: Student Dashboard", "Insert screenshot of /student page"),

          heading2("3.4 Lab Equipment Inventory Catalog"),
          p("Showcases lab equipment divided by Makers Lab 2 and Design IoT Lab. Each equipment card features category tags, condition ratings, max allowed borrow duration, faculty in-charge email, and an active availability progress meter."),
          diagramPlaceholder("Figure 9: Inventory Browsing Page", "Insert screenshot of /inventory page"),

          heading2("3.5 Requisition Checkout & Document Upload Modal"),
          p("Enables students to specify required item quantities, define expected return dates, state project purpose, and upload supporting letters (PDF/PNG up to 5MB) via multipart form upload."),
          diagramPlaceholder("Figure 10: Requisition Modal with Document Upload", "Insert screenshot of Borrow Request modal"),

          heading2("3.6 Faculty Approval & Handover Panel"),
          p("Provides laboratory faculty with a live queue of pending requests, applicant roll numbers, purpose descriptions, and attached documents. Faculty can approve or reject with remarks, confirm physical handover (decrementing inventory), and verify returns."),
          diagramPlaceholder("Figure 11: Faculty Approval Dashboard", "Insert screenshot of /faculty page"),

          heading2("3.7 Administrator Decision Override & Audit Trail"),
          p("Allows administrators to supervise both labs, override faculty decisions with mandatory justifications, inspect audit trails in the override log, and provision new faculty accounts with auto-generated passwords."),
          diagramPlaceholder("Figure 12: Admin Dashboard & Override Audit Logs", "Insert screenshot of /admin page"),

          heading2("3.8 Penalties & Overdue Violation Management"),
          p("Monitors outstanding dues, calculates daily late return fines and equipment damage charges, and enables administrators to record payments or grant official waivers."),
          diagramPlaceholder("Figure 13: Penalties Management Interface", "Insert screenshot of /penalties page"),

          // ==================== CHAPTER 4: OBSERVATIONS ====================
          pageBreak(),
          heading1("Chapter: 4 Observations"),
          heading2("4.1 Problems Encountered"),
          bullet("Initial Branch & Database Discrepancy: The project initially contained conflicting code between Sequelize/MySQL and Mongoose/MongoDB, requiring architectural unification into MongoDB Atlas."),
          bullet("Complex Inventory Stock Synchronization: Preventing race conditions where multiple students request the same low-stock item simultaneously was resolved by validating available quantities before creating requests."),
          bullet("Two-Factor Authentication Setup: Implementing standard TOTP verification required careful synchronization between server time windows and client authenticator apps."),
          bullet("Secure Multipart File Storage: Managing uploaded PDF and image documents required MIME-type validation, size limits (5MB), and authenticated streaming to protect student confidentiality."),
          bullet("Scheduling Return Reminders: Setting up node-cron background tasks that accurately distinguish between items due in 2 days, items due today, and overdue records."),

          heading2("4.2 Lessons Learned"),
          bullet("Mastery of the MERN Stack: Developed practical expertise in architecting RESTful APIs with Node.js/Express and building reactive user interfaces in React with Vite."),
          bullet("MongoDB Schema Modeling: Learned when to use embedded sub-documents (such as request items and approval logs) versus normalized ObjectId references (Users, Labs, InventoryItems)."),
          bullet("Role-Based Access Control (RBAC): Gained practical experience implementing granular JWT authorization middleware across diverse user roles."),
          bullet("Academic Project Lifecycle: Enhanced skills in requirements gathering, software documentation, and aligning engineering deliverables with institutional standards."),

          // ==================== CHAPTER 5: CONCLUSION ====================
          pageBreak(),
          heading1("Chapter: 5 Conclusion & Future Enhancement"),
          heading2("5.1 Achievements"),
          bullet("Successfully digitized the lab equipment borrowing lifecycle for Makers Lab 2 and Design IoT Lab at GSFC University."),
          bullet("Eliminated manual paper slips and registry bottlenecks, cutting student requisition turnaround times significantly."),
          bullet("Implemented automated inventory stock tracking that decrements items upon issue and restores stock upon return."),
          bullet("Delivered a role-based system with distinct, secure portals for Students, Faculty, and Administrators."),
          bullet("Integrated background cron scheduling for proactive return reminders and overdue penalty enforcement."),

          heading2("5.2 Future Developments"),
          bullet("QR Code & Barcode Scanning: Integrate barcode scanning on mobile devices to expedite item check-in and check-out at the lab counter."),
          bullet("SMS & WhatsApp Gateway Integration: Complement email alerts with instant WhatsApp messages for return deadlines."),
          bullet("Digital Faculty Signatures: Implement cryptographic e-signatures for official laboratory clearance certificates."),
          bullet("Predictive Inventory Analytics: Use historical usage data to forecast component shortages prior to semester project deadlines.")
        ]
      }
    ]
  });

  return doc;
}

async function main() {
  const doc = createReportDocument();
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync("Lab_Inventory_Management_System_Project_Report.docx", buffer);
  console.log("Successfully generated Lab_Inventory_Management_System_Project_Report.docx");
}

main().catch(console.error);
