import fs from "fs";
import path from "path";
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
  Packer,
  ImageRun,
  Header,
  Footer,
  PageNumber
} from "docx";

const DIAGRAM_DIR = path.resolve("assets/diagrams");
const SCREENSHOT_DIR = path.resolve("assets/screenshots");

function getFooter(pageLabel = "") {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: pageLabel ? `${pageLabel} | Page` : "",
            font: "Calibri",
            size: 18,
            color: "777777"
          })
        ]
      })
    ]
  });
}

function getHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            text: "GSFC UNIVERSITY • SCHOOL OF TECHNOLOGY",
            font: "Calibri",
            bold: true,
            size: 16,
            color: "5C381E"
          })
        ]
      })
    ]
  });
}

function createSection(children, pageNumberStr = "") {
  return {
    properties: {
      page: {
        margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 }
      }
    },
    headers: {
      default: getHeader()
    },
    footers: {
      default: getFooter(pageNumberStr)
    },
    children
  };
}

export function buildCompleteReport() {
  const pageBreak = () => new Paragraph({ children: [new TextRun({ break: 1 })], pageBreakBefore: true });

  const heading1 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 260, after: 200 },
      children: [new TextRun({ text, bold: true, size: 32, font: "Calibri", color: "2C1D11" })]
    });

  const heading2 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 220, after: 120 },
      children: [new TextRun({ text, bold: true, size: 26, font: "Calibri", color: "5C381E" })]
    });

  const heading3 = (text) =>
    new Paragraph({
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 80 },
      children: [new TextRun({ text, bold: true, size: 22, font: "Calibri", color: "222222" })]
    });

  const p = (text, options = {}) =>
    new Paragraph({
      alignment: options.align || AlignmentType.JUSTIFIED,
      spacing: { after: options.after || 140, line: 320 },
      children: [
        new TextRun({
          text,
          size: options.size || 24, // 12pt
          font: "Calibri",
          bold: options.bold || false,
          italics: options.italics || false,
          color: options.color || "222222"
        })
      ]
    });

  const bullet = (text, prefix = "• ") =>
    new Paragraph({
      spacing: { after: 70, line: 290 },
      indent: { left: 450 },
      children: [
        new TextRun({ text: prefix, bold: true, size: 24, font: "Calibri", color: "5C381E" }),
        new TextRun({ text, size: 24, font: "Calibri", color: "222222" })
      ]
    });

  const embeddedImage = (folder, filename, caption, width = 530, height = 310) => {
    const filePath = path.join(folder, filename);
    if (fs.existsSync(filePath)) {
      const imgBuffer = fs.readFileSync(filePath);
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 160, after: 80 },
          children: [
            new ImageRun({
              data: imgBuffer,
              transformation: {
                width,
                height
              }
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 180 },
          children: [
            new TextRun({
              text: caption,
              italics: true,
              size: 20,
              font: "Calibri",
              color: "555555"
            })
          ]
        })
      ];
    } else {
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 120, after: 120 },
          children: [
            new TextRun({ text: `[IMAGE: ${caption}]`, bold: true, size: 20, color: "8D2F1E", font: "Calibri" })
          ]
        })
      ];
    }
  };

  const sections = [];

  // ==================== PAGE 0: TITLE PAGE ====================
  sections.push({
    properties: {
      page: {
        margin: { top: 1200, bottom: 1200, left: 1400, right: 1400 }
      }
    },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 300, after: 140 },
        children: [
          new TextRun({
            text: "LAB INVENTORY MANAGEMENT SYSTEM",
            bold: true,
            size: 38,
            font: "Calibri",
            color: "2C1D11"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 360 },
        children: [
          new TextRun({
            text: "Hardware Clearance, Requisition & Gate Pass Management System\n\nA Project Report\nSubmitted\nIn partial fulfillment of the requirement for the award of the Degree of\nBachelor of Technology\nComputer Science and Engineering\n(Software Engineering)",
            size: 24,
            italics: true,
            font: "Calibri",
            color: "444444"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "GSFC UNIVERSITY\nEDUCATION RE-ENVISIONED",
            bold: true,
            size: 26,
            font: "Calibri",
            color: "5C381E"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Faculty Mentor: Ms. Yoothika Patel",
            bold: true,
            size: 24,
            font: "Calibri",
            color: "222222"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
        children: [
          new TextRun({
            text: "Submitted by: (25BT04D251) Harsh Shah, Maitrey Thanki",
            bold: true,
            size: 24,
            font: "Calibri",
            color: "222222"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 180, after: 80 },
        children: [
          new TextRun({
            text: "School of Technology,\nComputer Science & Engineering,\nGSFC University",
            bold: true,
            size: 22,
            font: "Calibri",
            color: "333333"
          })
        ]
      })
    ]
  });

  // ==================== PAGE 1: DECLARATION ====================
  sections.push(
    createSection([
      heading1("DECLARATION"),
      p(
        "We, Harsh Shah (25BT04D251) and Maitrey Thanki, the undersigned, hereby declare that the project report entitled \"Lab Inventory Management System – Hardware Clearance, Requisition & Gate Pass Management System\" is our original work and has been carried out under the guidance of Ms. Yoothika Patel, faculty at GSFC UNIVERSITY. The report is being submitted in partial fulfillment of the requirements for the B.Tech. in Computer Science and Engineering."
      ),
      new Paragraph({ spacing: { before: 1400 } }),
      p("Signature\n\n\n___________________________\nHarsh Shah (25BT04D251)\n\n\n___________________________\nMaitrey Thanki", { bold: true })
    ], "1")
  );

  // ==================== PAGE 2: CERTIFICATE ====================
  sections.push(
    createSection([
      heading1("CERTIFICATE"),
      p(
        "This is to certify that the report submitted along with the project entitled \"Lab Inventory Management System – Hardware Clearance, Requisition & Gate Pass Management System\" has been carried out by \"Harsh Shah (25BT04D251) and Maitrey Thanki\" under my guidance in partial fulfillment for the degree of Bachelor of Technology in Computer Science and Engineering – 5th Semester of GSFC University, Vadodara during the academic year 2026-27. The students have successfully completed the project activity under my guidance."
      ),
      new Paragraph({ spacing: { before: 1600 } }),
      p("Signature of Faculty Mentor:\n\n\n___________________________\nMs. Yoothika Patel\nAssistant Professor, School of Technology\nGSFC University, Vadodara", { bold: true })
    ], "2")
  );

  // ==================== PAGE 3: ACKNOWLEDGEMENT ====================
  sections.push(
    createSection([
      heading1("ACKNOWLEDGEMENT"),
      p(
        "We would like to express our sincere gratitude to Ms. Yoothika Patel, for her valuable guidance, continuous support, and encouragement throughout the development of our Software Engineering project, \"Lab Inventory Management System – Hardware Clearance, Requisition & Gate Pass Management System\"."
      ),
      p(
        "Her guidance and suggestions have helped us understand the various concepts of Software Engineering and apply them effectively in the planning, design, and development of our project. We are thankful for the time and effort she dedicated to guiding us and helping us improve our work."
      ),
      p(
        "We would also like to express our gratitude to our institution for providing us with the opportunity and learning environment to undertake this project. The development of Lab Inventory Management System has enabled us to gain practical knowledge of software development, system architecture, database management, and web application technologies."
      ),
      p(
        "Finally, we thank everyone who directly or indirectly supported us in completing this project successfully."
      ),
      p(
        "This project has been a valuable learning experience, helping us enhance our technical knowledge, problem-solving abilities, and teamwork skills."
      )
    ], "3")
  );

  // ==================== PAGE 4: ABSTRACT ====================
  sections.push(
    createSection([
      heading1("Abstract"),
      p(
        "Lab Inventory Management System is a web-based enterprise application designed to centralize and streamline the management of university engineering laboratories operating across multiple specialized facilities, including Makers Lab 2 and the Design IoT Laboratory. Managing laboratory hardware components, sensitive sensors, microcontroller development boards, and measuring equipment through manual paper slips, registers, or disconnected spreadsheets leads to equipment loss, inventory shortages, untracked overdue returns, inefficient student clearance, and lack of real-time auditability. The Lab Inventory Management System addresses these challenges by integrating complete laboratory requisition, hardware tracking, clearance, and security gate pass operations into a unified digital platform."
      ),
      p(
        "The system incorporates multiple interconnected modules, including authentication and role-based access control (RBAC), multi-lab facility management, real-time inventory catalog tracking, student borrow requisition workflows, digital document verification, single-page printable equipment gate passes with embedded QR verification, public zero-auth security verification portals, high-speed 30fps counter webcam check-in/out scanning, automated late penalty engines, damage assessment ledgers, digital no-dues clearance certification, and administrative audit logging. It supports distinct categories of users, including Students, Faculty Lab In-Charges, Laboratory Assistants, and System Administrators, ensuring each user interacts strictly with authorized capabilities."
      ),
      p(
        "The application is engineered on the modern MERN stack, comprising MongoDB Atlas, Express.js, React 18, and Node.js. React provides a responsive, responsive interface styled with custom CSS tokens, while Node.js and Express handle secure RESTful microservices. MongoDB, managed through Mongoose schemas, maintains consistent transactional records of assets, borrowings, approvals, and penalties. Time-Based One-Time Password (TOTP) two-factor authentication secures administrative consoles, while client-side canvas decoding with jsQR ensures seamless QR gate pass scanning across all devices."
      ),
      p(
        "The system replaces vulnerable manual paper slips with tamper-resistant digital gate passes and automated return compliance tracking, providing complete institutional visibility and operational excellence."
      ),
      new Paragraph({ spacing: { before: 200 } }),
      p(
        "Keywords: Lab Inventory Management, MERN Stack, Role-Based Access Control, Digital Gate Pass, QR Code Verification, No-Dues Clearance, Equipment Requisition, Audit Logging.",
        { bold: true, color: "5C381E" }
      )
    ], "4")
  );

  // ==================== PAGE 5-7: LIST OF FIGURES ====================
  const figuresData = [
    { num: "1", title: "Figure 1: Use Case Diagram", page: "34" },
    { num: "2", title: "Figure 2: Activity Diagram", page: "35" },
    { num: "3", title: "Figure 3: Sequence Diagram", page: "36" },
    { num: "4", title: "Figure 4: E-R Diagram", page: "37" },
    { num: "5", title: "Figure 5: DFD Level – 0\nFigure 6: DFD Level - 1", page: "38" },
    { num: "6", title: "Figure 7: Login Page Student & Faculty Login", page: "39" },
    { num: "7", title: "Figure 8: Login Page Admin Authenticator Login", page: "39" },
    { num: "8", title: "Figure 9: Inventory Catalog Page", page: "40" },
    { num: "9", title: "Figure 10: Component Checkout Requisition Modal", page: "40" },
    { num: "10", title: "Figure 11.1: Student Dashboard - Requisition History Page\nFigure 11.2: Student Dashboard - Digital No-Dues Certificate", page: "41\n42" },
    { num: "11", title: "Figure 12.1: Faculty Dashboard - Pending Approvals Page\nFigure 12.2: Faculty Dashboard - Handover Confirmation Form", page: "43\n44" },
    { num: "12", title: "Figure 13.1: Admin Dashboard - Overview Page\nFigure 13.2: Admin Dashboard - Inventory Master Management", page: "45\n46" },
    { num: "13", title: "Figure 13.3: Admin Dashboard - Labs Management Page\nFigure 13.4: Admin Dashboard - User Administration Page", page: "47\n48" },
    { num: "14", title: "Figure 13.5: Admin Dashboard - Audit Logs & Overrides Page", page: "49" },
    { num: "15", title: "Figure 14: Requests & Clearance Page with Status Filtering", page: "50" },
    { num: "16", title: "Figure 15: Laboratory Equipment Gate Pass Modal with QR", page: "51" },
    { num: "17", title: "Figure 16: Public Gate Pass Zero-Auth Verification Portal", page: "52" },
    { num: "18", title: "Figure 17: Lab Counter Quick Check-In / Check-Out Scanner Modal\nFigure 18: Lab Counter Scanner - 1-Click Handover & Return Form", page: "53\n54" },
    { num: "19", title: "Figure 19: Penalties & Damage Assessment Ledger Page", page: "55" },
    { num: "20", title: "Figure 20: CSV Export Confirmation & Reporting", page: "56" }
  ];

  const figureRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [p("Sr. No.", { bold: true, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [p("Title", { bold: true })] }),
        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [p("Pg. No.", { bold: true, align: AlignmentType.CENTER })] })
      ]
    })
  ];

  figuresData.forEach((f) => {
    figureRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [p(f.num, { align: AlignmentType.CENTER })] }),
          new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [p(f.title)] }),
          new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [p(f.page, { align: AlignmentType.CENTER })] })
        ]
      })
    );
  });

  sections.push(
    createSection([
      heading1("List of Figures"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: figureRows
      })
    ], "5")
  );

  // ==================== PAGE 8: TABLE OF CONTENTS ====================
  const tocData = [
    { num: "1.", title: "Title Page", page: "0" },
    { num: "2.", title: "Declaration", page: "1" },
    { num: "3.", title: "Certificate", page: "2" },
    { num: "4.", title: "Acknowledgement", page: "3" },
    { num: "5.", title: "Abstract", page: "4" },
    { num: "6.", title: "List of Figures", page: "5" },
    { num: "7.", title: "Table of Content", page: "8" },
    { num: "8.", title: "Chapter: 1 Introduction to Project", page: "9" },
    { num: "9.", title: "Chapter: 2 System Analysis and Design", page: "23" },
    { num: "10.", title: "Chapter: 3 Implementation of Project", page: "39" },
    { num: "11.", title: "Chapter: 4 Observations", page: "58" },
    { num: "12.", title: "Chapter: 5 Conclusion & Future Enhancement", page: "60" }
  ];

  const tocRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [p("Sr. No.", { bold: true, align: AlignmentType.CENTER })] }),
        new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [p("Title", { bold: true })] }),
        new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [p("Pg. No.", { bold: true, align: AlignmentType.CENTER })] })
      ]
    })
  ];

  tocData.forEach((t) => {
    tocRows.push(
      new TableRow({
        children: [
          new TableCell({ width: { size: 12, type: WidthType.PERCENTAGE }, children: [p(t.num, { align: AlignmentType.CENTER })] }),
          new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [p(t.title, { bold: t.title.startsWith("Chapter") })] }),
          new TableCell({ width: { size: 18, type: WidthType.PERCENTAGE }, children: [p(t.page, { align: AlignmentType.CENTER })] })
        ]
      })
    );
  });

  sections.push(
    createSection([
      heading1("Table of Content"),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tocRows
      })
    ], "8")
  );

  // ==================== CHAPTER 1: INTRODUCTION TO PROJECT ====================
  const ch1Children = [
    heading1("Chapter 1: Introduction to Project"),
    heading2("i. Overview"),
    p(
      "Lab Inventory Management System is a comprehensive web-based enterprise solution designed to simplify, automate, and centralize the operational activities of academic engineering laboratories operating across multiple physical facilities. The system unites essential laboratory management functions into a single platform, enabling seamless coordination between departmental administrators, laboratory faculty in-charges, lab assistants, and students."
    ),
    p(
      "In traditional academic environments, laboratory equipment borrowing relies heavily on paper registers, physical signing books, hand-filled requisition slips, and disjointed email communication. When educational institutions maintain multiple advanced facilities—such as Makers Lab 2 and the Design IoT Lab—these manual practices cause severe data inconsistencies, accidental component loss, unmonitored overdue borrowings, delayed project approvals, and zero real-time visibility into available hardware stocks. The Lab Inventory Management System overcomes these systemic shortcomings by providing a centralized database, structured validation rules, and automated digital workflows."
    ),
    p(
      "The system enforces Role-Based Access Control (RBAC) across distinct stakeholder groups, including Students, Faculty Members, Lab In-Charges, and System Administrators. Each role receives a dedicated, customized workspace with specific operations and privileges. For instance, students can search the inventory, request equipment loans, attach digital permission slips, and print verified gate passes. Faculty review pending queues, inspect attachments, approve or reject requisitions, and confirm physical handover. Administrators oversee all laboratory facilities, manage user credentials, audit system activities, and grant fee waivers."
    ),
    p(
      "Built entirely on the MERN stack (MongoDB, Express.js, React.js, and Node.js), the platform leverages React for an interactive, responsive presentation layer; Node.js and Express for high-performance REST APIs; and MongoDB Atlas for reliable, scalable document storage. Enhanced security features include Time-Based One-Time Password (TOTP) two-factor authentication for administrators, secure password hashing with bcrypt, JWT token validation, and client-side canvas decoding with jsQR for instant QR gate pass verification."
    ),
    p("The major modules of the Lab Inventory Management System are:"),

    heading3("Authentication and Authorization Module"),
    p("This module manages user identity verification and enforces access controls across all application resources:"),
    bullet("User login and credential verification using email and password."),
    bullet("Secure password hashing using salted bcrypt algorithms."),
    bullet("Time-Based One-Time Password (TOTP) two-factor authentication for administrative accounts."),
    bullet("Stateless JSON Web Token (JWT) session generation and validation."),
    bullet("Role-Based Access Control (RBAC) across student, faculty, and admin personas."),
    bullet("Protected frontend routes and secure backend API middleware verification."),
    bullet("Automatic token expiration, session refreshing, and unauthorized request interception."),

    heading3("User and Role Management Module"),
    p("This module allows authorized administrators to manage institutional accounts, roles, and departmental assignments:"),
    bullet("Create, update, activate, and deactivate student and faculty user profiles."),
    bullet("Assign appropriate role privileges and academic credentials."),
    bullet("Configure student enrollment roll numbers, semester, division, and residence types."),
    bullet("Associate faculty members with designated laboratory facilities."),
    bullet("Provide self-service password reset and credential management."),

    heading3("Laboratory Facility Management Module"),
    p("This module provides centralized administration of university laboratories and departmental facilities:"),
    bullet("Create and maintain laboratory facility records (e.g., Makers Lab 2, Design IoT Lab)."),
    bullet("Associate lab locations, room codes, and operating hours."),
    bullet("Designate faculty in-charges and lab assistant contacts for each facility."),
    bullet("Maintain facility-specific inventory ledgers and utilization histories."),

    heading3("Inventory and Component Tracking Module"),
    p("This module maintains real-time records of all laboratory hardware components, microcontrollers, and sensors:"),
    bullet("Create, update, and categorize hardware inventory items."),
    bullet("Track total physical quantity, available stock, and on-loan quantities in real time."),
    bullet("Assign unique asset codes, serial numbers, and equipment condition ratings."),
    bullet("Monitor low-stock thresholds and generate replenishment warnings."),
    bullet("Filter components by lab facility, technical category, and real-time availability."),

    heading3("Borrow Requisition and Checkout Workflow Module"),
    p("This module automates the complete lifecycle of equipment borrowing requests:"),
    bullet("Browse available hardware items and add required quantities to a requisition cart."),
    bullet("Specify intended academic project purpose, coursework details, and expected return dates."),
    bullet("Upload digital faculty permission letters, project endorsement forms, or sanction slips."),
    bullet("Track requisition states through defined transitions: Pending → Approved → Issued → Returned."),
    bullet("Provide faculty with one-click approval, rejection, and contextual feedback remarks."),

    heading3("Laboratory Equipment Gate Pass & Clearance Module"),
    p("This module generates official printable equipment gate passes with cryptographic authentication:"),
    bullet("Auto-generate institutional authorization passes upon faculty approval."),
    bullet("Display student credentials, enrollment numbers, program, and residential details."),
    bullet("List authorized component serials, quantities, and strict return deadlines."),
    bullet("Embed dynamic cryptographic QR codes linking to instant verification portals."),
    bullet("Support single-page `@media print` PDF generation with GSFC University institutional seals."),

    heading3("Public Zero-Auth Verification Portal Module"),
    p("This module provides a publicly accessible portal allowing security guards and external scanners to verify passes:"),
    bullet("Direct URL verification at `/verify/:id` accessible from any smartphone camera."),
    bullet("Zero authentication requirement to eliminate login barriers for gate security staff."),
    bullet("Display live cryptographic authenticity banners and institutional verification timestamps."),
    bullet("Show verified student identity, component list, faculty endorsement, and pass status."),
    bullet("Provide 1-click 'Open in Counter Scanner' actions for authenticated lab personnel."),

    heading3("Counter Quick Check-In / Check-Out Scanner Module"),
    p("This module enables laboratory assistants to execute rapid 1-click equipment handovers and returns:"),
    bullet("Real-time 30fps webcam viewfinder decoding QR codes via pure client-side `jsQR`."),
    bullet("Image file uploader allowing drag-and-drop decoding of gate pass screenshots and photos."),
    bullet("Universal reference search accepting Pass Ref `#GP-XXXX`, ObjectIds, or Student Roll Numbers."),
    bullet("One-click 'Issue Equipment' button that instantly decrements physical inventory stock."),
    bullet("One-click 'Accept Return' button that restores inventory availability and checks due dates."),
    bullet("Audio feedback chimes using the browser Web Audio API confirming scan success or warnings."),

    heading3("Damage Assessment & Penalty Ledger Module"),
    p("This module tracks equipment damage, missing accessories, and late return penalties:"),
    bullet("Record hardware condition on return (Good vs Damaged) with contextual notes."),
    bullet("Log financial damage liabilities and repair charges directly against student accounts."),
    bullet("Automated background cron jobs identifying overdue borrowings and computing late fees."),
    bullet("Administrative penalty ledger with full search, filtering, and fee waiver controls."),

    heading3("Digital No-Dues Clearance Certification Module"),
    p("This module evaluates student lab borrowing compliance for semester end clearance:"),
    bullet("Automated real-time audit across all active borrowings, unreturned items, and outstanding fines."),
    bullet("Instantly verify whether a student is completely free of academic lab liabilities."),
    bullet("Generate an official printable Digital No-Dues Certificate with GSFC University seal and QR code."),
    bullet("Eliminate manual physical clearance signatures across multiple departmental labs."),

    heading3("Audit Logging and System Analytics Module"),
    p("This module enforces operational accountability and provides managerial insights:"),
    bullet("Record all administrative overrides, status changes, and equipment modifications."),
    bullet("Capture actor identity, action type, affected resource, IP, and exact timestamp."),
    bullet("Generate facility-wise utilization reports, borrow frequencies, and stock turnover charts."),
    bullet("Export comprehensive requisition and inventory records as standard CSV files."),

    heading2("ii. Project Objective"),
    p("The primary objective of the Lab Inventory Management System is to design, implement, and deploy an enterprise-grade digital platform that eliminates paper-based laboratory tracking and ensures absolute accountability for institutional hardware assets."),
    p("The specific academic and operational objectives are as follows:"),
    bullet("1. Centralized Laboratory Management: To maintain a unified digital platform managing equipment across multiple university facilities (Makers Lab 2 and Design IoT Lab)."),
    bullet("2. Secure Role-Based Access Control: To enforce rigorous authentication and authorization separating Student, Faculty, and Administrator permissions."),
    bullet("3. Two-Factor Authentication: To integrate Time-Based One-Time Password (TOTP) security for privileged administrative operations."),
    bullet("4. Real-Time Inventory Control: To track hardware component quantities, condition states, asset codes, and availability dynamically upon every transaction."),
    bullet("5. Automated Requisition Workflows: To streamline borrowing requests, project endorsements, and faculty approval lifecycles."),
    bullet("6. Digital Document Verification: To support multi-format permission letter and document uploads during online checkout."),
    bullet("7. Institutional Gate Pass Issuance: To auto-generate printable equipment gate passes with GSFC University seals and security notices."),
    bullet("8. Universal QR Code Clearance: To encode verifiable deep links into gate passes readable by mobile cameras and barcode scanners."),
    bullet("9. Zero-Auth Public Verification: To provide a public verification portal allowing campus security guards to authenticate gate passes without login credentials."),
    bullet("10. Rapid Counter Check-In / Check-Out: To implement real-time 30fps webcam scanning and 1-click physical handover/return confirmation."),
    bullet("11. Automated Late Penalty Calculation: To compute daily overdue fines and damage assessment liabilities programmatically."),
    bullet("12. Digital No-Dues Clearance: To automate semester-end institutional clearance audits and issue cryptographic certificates."),
    bullet("13. Administrative Audit Trails: To maintain tamper-proof audit logs recording all administrative overrides and sensitive actions."),
    bullet("14. Maintainable MERN Architecture: To build a clean, modular full-stack codebase with reusable components and organized REST services."),
    bullet("15. Responsive User Interface: To provide a premium, accessible UI supporting desktop, laptop, tablet, and smartphone viewports."),

    heading2("iii. Scope of the Project"),
    p(
      "The scope of the project encompasses the end-to-end design, implementation, testing, and deployment of a full-stack laboratory inventory and clearance system for GSFC University. The system provides dedicated interfaces for Students, Faculty In-Charges, Lab Staff, and University Administrators."
    ),
    heading3("Addressing the Time Constraints"),
    p(
      "Developing a comprehensive laboratory enterprise management system within academic deadlines requires strict prioritization and structured development practices. The following measures were adopted:"
    ),
    bullet("Modular Architecture: Partitioning the application into independent, decoupled micro-modules (Auth, Inventory, Requests, Gate Pass, Scanner, Penalties, Clearance)."),
    bullet("Prioritization of Core Workflows: Focusing first on requisition lifecycles, stock state transitions, and gate pass generation before secondary reporting."),
    bullet("Reusable UI Component Library: Developing unified design tokens, modal wrappers, metric cards, and responsive tables to accelerate frontend implementation."),
    bullet("Consistent MERN Stack Tooling: Leveraging JavaScript across client and server (React Vite, Node.js, Express, Mongoose) to eliminate cross-language overhead."),
    bullet("Standardized RESTful Contracts: Implementing predictable API endpoints with structured JSON responses for parallel frontend and backend development."),
    bullet("Incremental Integration Testing: Conducting continuous functional and authorization tests during development rather than postponing testing to the final phase."),

    heading3("Addressing the Performance Constraint"),
    p(
      "The platform must maintain sub-second response times and smooth 60fps rendering even when handling hundreds of components, active borrowings, and concurrent users:"
    ),
    bullet("Optimized Database Indexing: Creating compound MongoDB indexes on frequently queried fields, including user email, asset codes, lab IDs, and request statuses."),
    bullet("Projection Queries: Limiting retrieved database fields strictly to attributes required by active views, avoiding heavy over-fetching."),
    bullet("Offscreen Canvas QR Processing: Decoding video frames using optimized HTML5 canvas pixel extraction with `jsQR`, minimizing main-thread CPU overhead."),
    bullet("Client-Side State Caching: Utilizing React state and URL search parameters to minimize redundant network round-trips."),
    bullet("Controlled Data Retrieval: Requesting pre-aggregated summary counts for dashboards rather than querying full database collections."),
    bullet("Lightweight Responsive Styling: Utilizing zero-runtime Vanilla CSS tokens instead of bloated utility frameworks, ensuring fast initial page loads."),

    heading3("Overall Project Scope"),
    p("The completed application encompasses the following verified capabilities:"),
    bullet("i. Management of multiple university laboratory facilities and departmental equipment stocks."),
    bullet("ii. Multi-role authentication with TOTP two-factor security for system administrators."),
    bullet("iii. Real-time component catalog with category filtering, search, and condition tracking."),
    bullet("iv. Requisition submission with multi-item selection and permission slip file uploads."),
    bullet("v. Facility-specific faculty review queues with approval remarks and return scheduling."),
    bullet("vi. Automatic inventory stock decrementing upon issue and stock restoration upon return."),
    bullet("vii. Single-page printable Equipment Gate Passes with GSFC University institutional branding."),
    bullet("viii. Public zero-auth Gate Pass verification portal accessible from mobile phone cameras."),
    bullet("ix. Real-time webcam Counter Scanner with animated laser reticle, image upload, and 1-click actions."),
    bullet("x. Penalty and damage assessment ledger with administrative waiver authorizations."),
    bullet("xi. Automated Digital No-Dues Clearance audit and cryptographic certificate generation."),
    bullet("xii. System audit logging with mandatory override justifications and CSV report exports.")
  ];

  sections.push(createSection(ch1Children, "9"));

  // ==================== CHAPTER 2: SYSTEM ANALYSIS AND DESIGN ====================
  const ch2Children = [
    heading1("Chapter 2: System Analysis and Design"),
    heading2("i. Disadvantages of Traditional Process"),
    p(
      "Traditional university laboratory management processes rely primarily on manual paper registers, physical logbooks, printed requisition slips, and ad-hoc email communications. When applied across modern engineering facilities, these traditional processes present severe limitations:"
    ),
    bullet("Manual Record Maintenance: Handwritten logbooks suffer from illegible handwriting, physical wear-and-tear, page loss, and accidental destruction."),
    bullet("Lack of Centralized Management: Different labs maintain isolated physical binders, making campus-wide inventory visibility completely impossible."),
    bullet("Inefficient Equipment Stock Tracking: Faculty cannot verify real-time component availability, leading to redundant purchases or unfulfilled student projects."),
    bullet("Delayed Approvals & Administrative Bottlenecks: Students must physically track down faculty members across campus to obtain manual signatures on paper slips."),
    bullet("Unmonitored Overdue Borrowings: Without automated notifications, students frequently retain lab hardware for months past project deadlines without consequence."),
    bullet("Difficult Penalty & Damage Tracking: Late return fines and hardware damage liabilities are tracked informally on paper, resulting in uncollected university fees."),
    bullet("Vulnerable Gate Pass Clearances: Paper gate passes are easily forged, manipulated, or lost, creating significant campus security and asset theft risks."),
    bullet("Cumbersome Semester No-Dues Clearance: Students spend days walking to every individual lab to obtain physical ink stamps for graduation clearance."),
    bullet("Absence of Audit Trails: Manual logbooks provide zero accountability when administrative overrides, unauthorized issuances, or missing items occur."),
    bullet("Lack of Operational Analytics: Department heads lack data on equipment failure rates, lab utilization patterns, and high-demand components."),
    p(
      "Therefore, a centralized, role-based web application is imperative to eliminate these operational failures and establish complete institutional accountability."
    ),

    heading2("ii. Proposed System"),
    p(
      "The Lab Inventory Management System is proposed as a modern, centralized full-stack web application that digitizes, automates, and unifies all laboratory borrowing, inventory control, and equipment clearance operations across GSFC University."
    ),
    p(
      "The proposed system connects all operational workflows into an integrated digital pipeline. A student browses available hardware online, submits a requisition, and attaches their faculty project letter. The designated lab in-charge receives the application in their facility queue, verifies the attachment, and approves the borrowing. When the student arrives at the lab counter, the staff confirms physical handover via the counter scanner, automatically decrementing the inventory stock. The system generates an official Equipment Gate Pass with a cryptographic QR code. Security guards can scan this QR code with any mobile device to view a verified digital clearance certificate without needing login credentials. When hardware is returned, condition checks and overdue fines are evaluated automatically, restocked in the database, and logged in the institutional audit ledger."
    ),
    heading3("Benefits"),
    p("The proposed system delivers substantial operational advantages:"),
    bullet("Centralized Information Management: Complete campus-wide inventory visibility across all labs in a single unified database."),
    bullet("Substantial Reduction in Administrative Burden: Eliminates manual logbook entry and reduces faculty approval turnaround from days to minutes."),
    bullet("Total Asset Accountability: Every component is tracked from initial cataloging to physical handover and return inspection."),
    bullet("Elimination of Paper Slips: Tamper-proof digital gate passes with QR verification prevent document forgery and loss."),
    bullet("Zero-Barrier Security Verification: Campus security guards can authenticate passes instantly on mobile devices with zero login friction."),
    bullet("High-Speed Counter Operations: Real-time webcam scanning enables 1-click handovers and returns in under 3 seconds."),
    bullet("Automated Late Fee Enforcement: Eliminates lost institutional revenue by calculating daily overdue fines programmatically."),
    bullet("Instant No-Dues Clearance: Replaces multi-day physical campus clearance walks with instant digital certification."),
    bullet("Tamper-Proof Audit Logging: Enforces mandatory justifications on administrative overrides, guaranteeing administrative transparency."),
    bullet("Data-Driven Procurement Planning: Analytics dashboards highlight high-demand items, equipment failure rates, and lab utilization trends."),

    heading2("iii. Requirements Gathering Methods"),
    p(
      "Requirements engineering was conducted through systematic analysis of university laboratory operations, stakeholder interviews with lab technicians and students, and examination of existing paper-based logbooks:"
    ),
    heading3("Stakeholder Identification"),
    p("Key stakeholder groups and their core operational requirements were identified:"),
    bullet("Students: Require equipment browsing, online checkout, permission letter uploads, return deadline tracking, and digital gate pass access."),
    bullet("Faculty In-Charges: Require facility queue filtering, application reviews, document inspection, approval remarks, and handover confirmation."),
    bullet("Laboratory Assistants: Require high-speed counter check-in/out, physical condition logging, and quick barcode/QR scanning."),
    bullet("System Administrators: Require multi-lab configuration, user credential management, audit review, and fine waiver controls."),
    bullet("Campus Security Staff: Require instant mobile verification of equipment gate passes at campus exit checkpoints without logging in."),

    heading3("Study of Existing Processes"),
    p(
      "Analysis of current physical logbooks at Makers Lab 2 revealed frequent entry duplication, missing student contact numbers, unrecorded return dates, and untracked late penalties."
    ),

    heading3("Use-Case Identification"),
    p(
      "User interactions were formalized into structured use cases defining boundaries between actors and system microservices (e.g., student checkout, faculty approval, counter scan handover, security verification)."
    ),

    heading3("Functional Decomposition"),
    p(
      "The system architecture was decomposed into discrete functional subsystems (Authentication, Inventory, Requisitions, Gate Pass, Scanner, Penalties, Clearance, Audit) for modular implementation."
    ),

    heading3("Validation of Requirements"),
    p(
      "Requirements were validated against institutional laboratory safety policies, electrostatic discharge handling guidelines, and university academic clearance statutes."
    ),

    heading2("iv. Functional Requirements"),
    p("The detailed functional requirements of the system are categorized as follows:"),

    bullet("FR-01 (Authentication): The system shall authenticate users securely using email and password with salted bcrypt verification."),
    bullet("FR-02 (2FA Security): The system shall require a valid 6-digit TOTP authenticator token for administrative login access."),
    bullet("FR-03 (Role Authorization): The system shall enforce Role-Based Access Control restricting routes and APIs based on user personas."),
    bullet("FR-04 (User Management): The system shall allow administrators to create, update, activate, and deactivate student and faculty accounts."),
    bullet("FR-05 (Facility Configuration): The system shall support multi-lab facility management and associate faculty in-charges with specific labs."),
    bullet("FR-06 (Inventory Catalog): The system shall maintain hardware items with asset codes, categories, total stock, and available stock."),
    bullet("FR-07 (Stock Availability): The system shall automatically compute available quantities and prevent checkout when stock is zero."),
    bullet("FR-08 (Checkout Requisition): The system shall allow students to select components, quantities, return deadlines, and project purpose."),
    bullet("FR-09 (Document Upload): The system shall support uploading faculty permission letters and project sanction documents (PDF/PNG/JPEG)."),
    bullet("FR-10 (Review Queue): The system shall provide faculty with facility-filtered queues showing pending borrow requests and uploaded files."),
    bullet("FR-11 (Decision Processing): The system shall allow faculty to approve or reject requisitions with mandatory feedback remarks."),
    bullet("FR-12 (Physical Handover): The system shall confirm hardware handover and automatically decrement inventory stock in the database."),
    bullet("FR-13 (Gate Pass Generation): The system shall generate official single-page printable Equipment Gate Passes upon approval."),
    bullet("FR-14 (QR Code Clearance): The system shall embed dynamic QR codes into gate passes encoding verified public deep links."),
    bullet("FR-15 (Public Verification): The system shall provide a public `/verify/:id` route showing verified clearance data without login barriers."),
    bullet("FR-16 (Counter Scanner): The system shall support real-time 30fps webcam QR decoding via jsQR on an offscreen canvas."),
    bullet("FR-17 (Image QR Decode): The system shall allow uploading screenshots or photos of QR codes to decode requisitions instantly."),
    bullet("FR-18 (Instant Handover/Return): The system shall provide 1-click handover and return confirmation buttons in the counter scanner."),
    bullet("FR-19 (Condition & Damage Logging): The system shall allow staff to record item condition (Good vs Damaged) and log financial repair penalties."),
    bullet("FR-20 (Overdue Fine Calculation): The system shall compute automated daily late fines for borrowings retained past the approved due date."),
    bullet("FR-21 (Penalty Management): The system shall provide an administrative ledger to track unpaid fines and record authorized fee waivers."),
    bullet("FR-22 (No-Dues Audit): The system shall automatically audit student records across all labs and issue cryptographic No-Dues Certificates."),
    bullet("FR-23 (Audit Logging): The system shall maintain immutable audit logs for all administrative overrides, capturing actor, action, and timestamp."),

    heading2("v. Non-Functional Requirements"),
    p("The operational standards and quality constraints governing system execution include:"),
    bullet("Security: Passwords hashed with bcrypt (salt rounds = 10); JWT tokens signed with secure keys; TOTP authentication; sanitized input."),
    bullet("Performance: API response times under 200ms; client page rendering under 500ms; webcam scanning at 30 frames per second."),
    bullet("Reliability: Transactional stock consistency; automatic Mongoose schema validation; graceful error recovery with user-friendly alerts."),
    bullet("Usability: Clean, intuitive UI with responsive navigation, status badges, audio scan chimes, and single-click quick actions."),
    bullet("Maintainability: Modular MERN codebase with separation of concerns between controllers, routes, models, components, and hooks."),
    bullet("Scalability: Stateless backend microservices supporting horizontal scaling and MongoDB Atlas cloud clustering."),
    bullet("Availability: Designed for 99.9% uptime during university operating hours with automated health check endpoints."),
    bullet("Data Integrity: Referential integrity across borrowings, users, labs, and penalties with atomic database updates."),
    bullet("Portability & Responsiveness: Fully functional across Google Chrome, Mozilla Firefox, Apple Safari, Microsoft Edge, and mobile viewports."),
    bullet("Compatibility & Integration: Standard JSON REST APIs allowing integration with university ERP and student registry systems."),
    bullet("Testability: Structured unit, integration, and end-to-end browser test suites verifying all critical user journeys."),
    bullet("Data Privacy: Role-based data masking ensuring students only view their own records and personal student data is shielded."),

    heading2("vi. UML Diagrams"),
    p(
      "Unified Modeling Language (UML) diagrams visually communicate the structural, behavioral, and architectural design of the Lab Inventory Management System."
    ),

    heading3("Use Case Diagram"),
    p(
      "Describes interactions between external actors (Students, Faculty In-Charge, Lab Assistants, System Administrators, Security Staff) and core system services."
    ),
    ...embeddedImage(DIAGRAM_DIR, "fig1_use_case.png", "Figure 1: Use Case Diagram", 520, 320),

    heading3("Activity Diagram"),
    p(
      "Models the complete operational workflow from initial component checkout, faculty approval, physical counter handover, active loan use, condition inspection, to stock restoration and penalty calculation."
    ),
    ...embeddedImage(DIAGRAM_DIR, "fig2_activity.png", "Figure 2: Activity Diagram", 440, 480),

    heading3("Sequence Diagram"),
    p(
      "Illustrates chronological message interactions exchanged between Student, React Frontend, Express API, MongoDB Atlas, and Lab Staff during equipment requisition and clearance."
    ),
    ...embeddedImage(DIAGRAM_DIR, "fig3_sequence.png", "Figure 3: Sequence Diagram", 480, 420),

    heading3("Entity-Relationship (E-R) Diagram"),
    p(
      "Visualizes the conceptual data model, depicting collections (Users, Labs, InventoryItems, BorrowRequests, Penalties, AuditLogs), attributes, primary keys, and relational constraints."
    ),
    ...embeddedImage(DIAGRAM_DIR, "fig4_er_diagram.png", "Figure 4: E-R Diagram", 500, 380),

    heading3("Data Flow Diagram (DFD)"),
    p(
      "Illustrates data flow boundaries between external entities, business processes, and persistent data stores at Level 0 (Context Level) and Level 1 (Functional Decomposition)."
    ),
    ...embeddedImage(DIAGRAM_DIR, "fig5_dfd_level0.png", "Figure 5: DFD Level – 0", 500, 240),
    ...embeddedImage(DIAGRAM_DIR, "fig6_dfd_level1.png", "Figure 6: DFD Level - 1", 500, 360)
  ];

  sections.push(createSection(ch2Children, "23"));

  // ==================== CHAPTER 3: IMPLEMENTATION OF PROJECT ====================
  const ch3Children = [
    heading1("Chapter 3: Implementation of Project"),
    p(
      "This chapter presents the practical realization and visual interface implementation of the Lab Inventory Management System. The user interface was developed with responsive Vanilla CSS and React, following modern design guidelines with rich institutional aesthetics, accessible typography, status badges, and interactive feedback."
    ),

    heading2("Authentication & Access Interfaces"),
    p("The system provides dedicated authentication workflows for general users and privileged administrators:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig7_login.png", "Figure 7: Login Page Staff Login (Student & Faculty Roles)", 520, 290),
    p(
      "Figure 7 illustrates the unified user login interface. Users select their institutional role (Student or Faculty) and authenticate using their registered university email and secure password. The interface features responsive tab switching and form validation."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig8_admin_login.png", "Figure 8: Login Page Admin Authenticator Login (TOTP 2FA)", 520, 290),
    p(
      "Figure 8 showcases the administrative login portal featuring mandatory Time-Based One-Time Password (TOTP) two-factor authentication. Administrators enter their authorized email alongside a live 6-digit rolling code generated from their authenticator app."
    ),

    heading2("Hardware Inventory & Requisition Workflows"),
    p("Students browse available hardware components across campus facilities and initiate borrow requisitions:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig9_inventory.png", "Figure 9: Inventory Catalog Page (Real-Time Stock & Filters)", 520, 290),
    p(
      "Figure 9 depicts the hardware catalog. Components are organized by technical category (Microcontrollers, Sensors, Wireless IoT, Measurement, Actuators) and issuing facility. Live available quantities and asset codes are visible in real time."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig10_requisition_modal.png", "Figure 10: Component Checkout Requisition Modal (Document Upload)", 520, 290),
    p(
      "Figure 10 presents the requisition checkout modal. Students specify quantity, project purpose, expected return date, and attach supporting permission letters or project sanction documents via drag-and-drop file upload."
    ),

    heading2("Student Dashboard & Clearance"),
    p("Students monitor active borrowings, due dates, and generate institutional clearance certificates:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig11_1_student_dashboard.png", "Figure 11.1: Student Dashboard - Requisition History Page", 520, 290),
    p(
      "Figure 11.1 illustrates the student dashboard. Metric cards summarize active loans, approved items, due soon warnings, and outstanding penalties. The borrowing history list provides instant access to printable Gate Passes."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig11_2_nodues_modal.png", "Figure 11.2: Student Dashboard - Digital No-Dues Certificate Modal", 520, 290),
    p(
      "Figure 11.2 displays the automated Digital No-Dues Clearance Certificate modal. The system evaluates borrowing histories across all labs in real time and issues an official certificate with GSFC University branding and verification QR code."
    ),

    heading2("Faculty Dashboard & Handover Operations"),
    p("Faculty members review facility-specific pending applications and confirm physical equipment handovers:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig12_1_faculty_approvals.png", "Figure 12.1: Faculty Dashboard - Pending Approvals Page", 520, 290),
    p(
      "Figure 12.1 showcases the faculty approval queue. Faculty in-charges inspect student details, coursework purpose, and attached permission files, approving or rejecting requisitions with contextual feedback remarks."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig12_2_faculty_handover.png", "Figure 12.2: Faculty Dashboard - Handover Confirmation Form", 520, 290),
    p(
      "Figure 12.2 demonstrates active loan monitoring and physical handover confirmation. Faculty confirm component collection, automatically decrementing available stock and establishing loan accountability."
    ),

    heading2("Administrative Console & Lab Operations"),
    p("Administrators oversee institutional metrics, inventory masters, lab facilities, and audit trails:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig13_1_admin_overview.png", "Figure 13.1: Admin Dashboard - Overview Page (Metrics & Analytics)", 520, 290),
    p(
      "Figure 13.1 presents the administrative executive dashboard, featuring campus-wide hardware utilization metrics, total borrowings, active penalty counts, and facility distribution statistics."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig13_2_admin_inventory.png", "Figure 13.2: Admin Dashboard - Inventory Master Management", 520, 290),
    p(
      "Figure 13.2 illustrates inventory master management. Administrators add new hardware components, edit stock quantities, assign asset codes, and manage laboratory component allocations."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig13_3_admin_labs.png", "Figure 13.3: Admin Dashboard - Labs Management Page", 520, 290),
    p(
      "Figure 13.3 shows laboratory facility administration. Admins configure laboratory names, facility locations, room numbers, and assign faculty in-charges for Makers Lab 2 and Design IoT Lab."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig13_4_admin_users.png", "Figure 13.4: Admin Dashboard - User Administration Page", 520, 290),
    p(
      "Figure 13.4 depicts user administration and role management. Administrators review user accounts, modify role permissions, update student roll numbers, and enforce account activations."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig13_5_admin_audit.png", "Figure 13.5: Admin Dashboard - Audit Logs & Overrides Page", 520, 290),
    p(
      "Figure 13.5 showcases the immutable system audit log. Every administrative override, role adjustment, and stock modification is logged with actor details, action types, and exact timestamps."
    ),

    heading2("Equipment Gate Pass & Verification Portal"),
    p("The system provides comprehensive gate pass issuance, mobile camera verification, and counter scanning:"),
    ...embeddedImage(SCREENSHOT_DIR, "fig14_requests_page.png", "Figure 14: Requests & Clearance Page with Status Filtering", 520, 290),
    p(
      "Figure 14 shows the Borrow Requests & Clearance page. Users filter requisitions across status tabs (All, Pending, Approved, Issued, Returned, Overdue, Rejected), search by reference ID, and print gate passes."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig15_gate_pass_modal.png", "Figure 15: Laboratory Equipment Gate Pass Modal with Dynamic QR", 520, 290),
    p(
      "Figure 15 presents the official Laboratory Equipment Gate Pass modal. Featuring the GSFC University seal, student identification, authorized equipment inventory table, institutional liability disclaimer, and dynamic verification QR code."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig16_public_verify_page.png", "Figure 16: Public Gate Pass Zero-Auth Verification Portal (/verify/:id)", 520, 290),
    p(
      "Figure 16 illustrates the standalone public verification portal. Designed for smartphone camera scanning, security guards authenticate gate passes instantly without requiring application login."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig17_counter_scanner_modal.png", "Figure 17: Lab Counter Quick Check-In / Check-Out Scanner Modal", 520, 290),
    p(
      "Figure 17 shows the Counter Scanner modal featuring live 30fps webcam scanning, animated laser reticles, image upload QR decoding, and instant sample requisition test chips."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig18_counter_scanner_action.png", "Figure 18: Lab Counter Scanner - 1-Click Handover & Return Form", 520, 290),
    p(
      "Figure 18 demonstrates instant requisition lookup. Counter staff execute 1-click physical handover or return acceptance with optional damage penalty assessment."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig19_penalties_page.png", "Figure 19: Penalties & Damage Assessment Ledger Page", 520, 290),
    p(
      "Figure 19 showcases the Penalties & Damage Assessment Ledger. Late return fees and hardware repair liabilities are tracked with full payment status, student filters, and administrative waiver actions."
    ),

    ...embeddedImage(SCREENSHOT_DIR, "fig20_csv_export.png", "Figure 20: CSV Export Confirmation & Reporting", 520, 290),
    p(
      "Figure 20 demonstrates CSV export reporting. All requisition records, borrowing timelines, and approval notes are exported into standard CSV spreadsheets for academic reporting."
    )
  ];

  sections.push(createSection(ch3Children, "39"));

  // ==================== CHAPTER 4: OBSERVATIONS ====================
  const ch4Children = [
    heading1("Chapter 4: Observations"),
    heading2("i. Problems Encountered"),
    p(
      "During the analysis, architectural design, and full-stack development of the Lab Inventory Management System, several technical and structural challenges arose due to the integration of complex hardware borrowing lifecycles into a unified web application:"
    ),
    bullet("Role-Based Access Control & Route Guarding: Managing three distinct user personas (Student, Faculty, Admin) and preventing unauthorized API access required robust server middleware and reactive client route wrappers."),
    bullet("Database Schema Design & State Integrity: Modeling complex document relationships between users, facilities, inventory items, and borrow requests while ensuring inventory available quantities never become negative."),
    bullet("Universal Webcam QR Decoding: Browser-native `BarcodeDetector` APIs are unsupported by default on standard browsers; resolving this required implementing pure client-side canvas decoding via `jsQR`."),
    bullet("Public Verification Security & Data Sanitization: Enabling external security guards to verify gate passes without login required creating a zero-auth public endpoint that sanitizes sensitive user information."),
    bullet("Strict Single-Page Print Layout Architecture: Gate passes required precise `@media print` CSS rules to eliminate browser margins, hide navigation bars, and ensure crisp single-page PDF output."),
    bullet("Time Management & Academic Scheduling: Delivering 11 interconnected modules within academic deadlines necessitated prioritizing core requisition workflows before secondary analytics."),
    bullet("Testing & Cross-Device Compatibility: Validating webcam permissions, responsive flex layouts, and sound playback across desktop, laptop, and mobile devices."),

    heading2("ii. Lessons Learned"),
    p(
      "The engineering of the Lab Inventory Management System provided extensive hands-on experience in applying professional software engineering methodologies to a real-world enterprise problem:"
    ),
    bullet("Modular Full-Stack Development: Gained deep expertise in architecting clean, maintainable systems using the MERN stack (MongoDB, Express.js, React, Node.js)."),
    bullet("State Machine Design: Learned to model hardware borrowing lifecycles as strict state machines (Pending → Approved → Issued → Returned) with automated inventory synchronization."),
    bullet("Client-Side Canvas Image Processing: Understood how to capture video frames, manipulate imageData buffers, and decode QR codes at 30 frames per second using `jsQR`."),
    bullet("API Security & Authorization: Mastered JWT token generation, salted bcrypt password hashing, and role-based route middleware protection."),
    bullet("Responsive UI & Accessibility: Implemented responsive design tokens, accessible color contrasts, micro-animations, and audio feedback for optimal usability."),
    bullet("Pair Programming & Version Control: Developed rigorous Git branching habits (`main` and `pr1`), code reviews, and structured commit workflows.")
  ];

  sections.push(createSection(ch4Children, "58"));

  // ==================== CHAPTER 5: CONCLUSION & FUTURE ENHANCEMENT ====================
  const ch5Children = [
    heading1("Chapter 5: Conclusion & Future Enhancement"),
    heading2("i. Conclusion"),
    p(
      "The Lab Inventory Management System successfully replaces antiquated paper logbooks and manual clearance slips with a modern, high-performance web enterprise application tailored to university engineering laboratories."
    ),
    p(
      "Developed on the MERN stack, the application centralizes hardware inventory across multiple university facilities (Makers Lab 2 and Design IoT Lab), automates student borrowing workflows, enforces role-based approvals, and issues cryptographic QR-enabled Equipment Gate Passes. The inclusion of a zero-auth public verification portal empowers campus security personnel to verify clearances on smartphones in real time, while the 30fps webcam Counter Scanner reduces physical handovers and returns to single-click operations."
    ),
    p(
      "The project demonstrates the practical application of key software engineering disciplines, including requirements engineering, UML modeling, relational and document database design, RESTful API development, two-factor authentication security, and rigorous system validation. The resulting platform eliminates equipment loss, ensures complete operational accountability, and establishes a robust foundation for institutional laboratory management."
    ),

    heading2("ii. Future Enhancement"),
    p("The system can be enhanced in subsequent development phases in the following ways:"),
    bullet("Physical RFID Hardware Integration: Interfacing physical RFID readers at lab doorways to detect unissued hardware removal automatically."),
    bullet("Automated SMS & WhatsApp Alerts: Integrating university communication gateways to dispatch instant return reminders directly to student phones."),
    bullet("IoT Smart Hardware Lockers: Connecting with microcontroller-operated smart lockers enabling autonomous 24/7 hardware pickup and drop-off."),
    bullet("AI-Based Demand Forecasting: Utilizing machine learning algorithms on historical borrowing data to predict peak component demand and automate procurement."),
    bullet("Native Mobile Application: Developing native iOS and Android apps with push notifications and offline equipment inspection capabilities."),
    bullet("Enterprise ERP Integration: Connecting with university registrar databases for automatic student enrollment verification and academic fee holds.")
  ];

  sections.push(createSection(ch5Children, "60"));

  return new Document({
    sections
  });
}

async function run() {
  console.log("Generating Lab Inventory Management System Project Report (.docx)...");
  const doc = buildCompleteReport();
  const buffer = await Packer.toBuffer(doc);
  const outputPath = path.resolve("Lab_Inventory_Management_System_Project_Report.docx");
  fs.writeFileSync(outputPath, buffer);
  console.log(`Report successfully generated: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(2)} MB)`);
}

run().catch((err) => {
  console.error("Docx generation failed:", err);
  process.exit(1);
});
