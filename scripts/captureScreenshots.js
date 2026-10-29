import fs from "fs";
import path from "path";
import puppeteer from "puppeteer-core";

const CHROME_PATH = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const BASE_URL = "http://localhost:5173";
const API_URL = "http://localhost:5000/api";
const SCREENSHOT_DIR = path.resolve("assets/screenshots");

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

async function getAuthToken(email, password, role = "student", otp = null) {
  if (role === "admin") {
    const res = await fetch(`${API_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp: otp || "123456" })
    });
    return res.json();
  } else {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role })
    });
    return res.json();
  }
}

async function capture() {
  console.log("Launching Chrome to capture all 20 implementation figures...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,840"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 840, deviceScaleFactor: 2 });

  // 1. Figure 7: Login Page Student / Faculty Login
  console.log("Capturing Figure 7: Login Page...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig7_login.png") });

  // 2. Figure 8: Admin Login Page
  console.log("Capturing Figure 8: Admin Authenticator Login...");
  await page.goto(`${BASE_URL}/admin-login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig8_admin_login.png") });

  // 3. Login as Student
  const studentAuth = await getAuthToken("student@university.edu", "password123", "student");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, studentAuth);

  // 4. Figure 9: Inventory Catalog
  console.log("Capturing Figure 9: Inventory Catalog...");
  await page.goto(`${BASE_URL}/inventory`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig9_inventory.png") });

  // 5. Figure 10: Component Checkout Requisition Modal
  console.log("Capturing Figure 10: Component Checkout Requisition Modal...");
  const requestBtn = await page.$("button.btn-primary:not(:disabled)");
  if (requestBtn) {
    await requestBtn.click();
    await new Promise((r) => setTimeout(r, 600));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig10_requisition_modal.png") });
    // Close modal
    const closeBtn = await page.$(".close-btn, button.btn-outline");
    if (closeBtn) await closeBtn.click();
    await new Promise((r) => setTimeout(r, 400));
  }

  // 6. Figure 11.1: Student Dashboard
  console.log("Capturing Figure 11.1: Student Dashboard...");
  await page.goto(`${BASE_URL}/student`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig11_1_student_dashboard.png") });

  // 7. Figure 11.2: Digital No-Dues Clearance Certificate Modal
  console.log("Capturing Figure 11.2: No-Dues Certificate Modal...");
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("No-Dues") || b.textContent.includes("Clearance"));
    if (btn) btn.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig11_2_nodues_modal.png") });

  // 8. Login as Faculty (Makers Lab 2)
  console.log("Capturing Figure 12.1 & 12.2: Faculty Dashboard...");
  const facultyAuth = await getAuthToken("faculty.makers@university.edu", "password123", "faculty");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, facultyAuth);

  await page.goto(`${BASE_URL}/faculty`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig12_1_faculty_approvals.png") });

  // Scroll down to active loans
  await page.evaluate(() => window.scrollBy(0, 450));
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig12_2_faculty_handover.png") });

  // 9. Login as Admin
  console.log("Capturing Figure 13.1 - 13.5: Admin Dashboard tabs...");
  const adminAuth = await getAuthToken("admin@university.edu", "", "admin", "123456");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, adminAuth);

  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_1_admin_overview.png") });

  // Click Inventory Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".tab-btn, .tab-group button"));
    const invTab = tabs.find((t) => t.textContent.includes("Inventory"));
    if (invTab) invTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_2_admin_inventory.png") });

  // Click Labs Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".tab-btn, .tab-group button"));
    const labTab = tabs.find((t) => t.textContent.includes("Labs"));
    if (labTab) labTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_3_admin_labs.png") });

  // Click Users Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".tab-btn, .tab-group button"));
    const userTab = tabs.find((t) => t.textContent.includes("Users"));
    if (userTab) userTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_4_admin_users.png") });

  // Click Audit Tab
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll(".tab-btn, .tab-group button"));
    const auditTab = tabs.find((t) => t.textContent.includes("Audit"));
    if (auditTab) auditTab.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_5_admin_audit.png") });

  // 10. Figure 14: Requests & Clearance Page
  console.log("Capturing Figure 14: Requests & Clearance Page...");
  await page.goto(`${BASE_URL}/requests`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig14_requests_page.png") });

  // 11. Figure 15: Gate Pass Modal
  console.log("Capturing Figure 15: Gate Pass Modal...");
  await page.evaluate(() => {
    const gatePassBtns = Array.from(document.querySelectorAll("button")).filter((b) => b.textContent.includes("Gate Pass"));
    if (gatePassBtns.length > 0) gatePassBtns[0].click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig15_gate_pass_modal.png") });

  // Close modal
  await page.evaluate(() => {
    const closeBtn = document.querySelector(".gate-pass-toolbar button.btn-outline");
    if (closeBtn) closeBtn.click();
  });
  await new Promise((r) => setTimeout(r, 400));

  // 12. Figure 16: Public Gate Pass Zero-Auth Verification Portal
  console.log("Capturing Figure 16: Public Gate Pass Verification Portal...");
  await page.goto(`${BASE_URL}/verify/6ae34b7e76d511c011bafe49`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig16_public_verify_page.png") });

  // 13. Figure 17 & 18: Counter Scanner Modal
  console.log("Capturing Figure 17 & 18: Counter Scanner Modal...");
  await page.goto(`${BASE_URL}/requests`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 600));
  // Click Counter Scanner button
  await page.evaluate(() => {
    const scannerBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Counter Scanner"));
    if (scannerBtn) scannerBtn.click();
  });
  await new Promise((r) => setTimeout(r, 600));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig17_counter_scanner_modal.png") });

  // Click quick test sample chip
  await page.evaluate(() => {
    const chips = Array.from(document.querySelectorAll(".modal-panel.scanner-modal button.badge"));
    if (chips.length > 0) chips[0].click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig18_counter_scanner_action.png") });

  // 14. Figure 19: Penalties Page
  console.log("Capturing Figure 19: Penalties Ledger...");
  await page.goto(`${BASE_URL}/penalties`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 800));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig19_penalties_page.png") });

  // 15. Figure 20: Export CSV
  console.log("Capturing Figure 20: CSV Export Confirmation...");
  await page.goto(`${BASE_URL}/requests`, { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 600));
  await page.evaluate(() => {
    const exportBtn = Array.from(document.querySelectorAll("button")).find((b) => b.textContent.includes("Export CSV"));
    if (exportBtn) exportBtn.click();
  });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig20_csv_export.png") });

  await browser.close();
  console.log("Successfully captured all 20 figures!");
}

capture().catch((err) => {
  console.error("Capture script encountered an error:", err);
  process.exit(1);
});
