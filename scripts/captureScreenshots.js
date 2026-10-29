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
  console.log("Launching headless Chrome to capture Chapter 3 screenshots...");
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,820"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 820, deviceScaleFactor: 2 });

  // 1. Figure 6: Unified Login Page
  console.log("Capturing Figure 6: Login Page...");
  await page.goto(`${BASE_URL}/login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig6_login.png") });

  // 2. Figure 7: Admin Authenticator Login
  console.log("Capturing Figure 7: Admin Login...");
  await page.goto(`${BASE_URL}/admin-login`, { waitUntil: "networkidle2" });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig7_admin_login.png") });

  // 3. Login as Student
  const studentAuth = await getAuthToken("student@university.edu", "password123", "student");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, studentAuth);

  // 4. Figure 8: Student Dashboard
  console.log("Capturing Figure 8: Student Dashboard...");
  await page.goto(`${BASE_URL}/student`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig8_student_dashboard.png") });

  // 5. Figure 9: Inventory Browsing
  console.log("Capturing Figure 9: Inventory Catalog...");
  await page.goto(`${BASE_URL}/inventory`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig9_inventory.png") });

  // 6. Figure 10: Requisition Modal
  console.log("Capturing Figure 10: Requisition Checkout Modal...");
  const requestBtn = await page.$("button.btn-primary:not(:disabled)");
  if (requestBtn) {
    await requestBtn.click();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig10_requisition_modal.png") });
  }

  // 7. Login as Faculty (Makers Lab 2)
  console.log("Capturing Figure 11: Faculty Approval Dashboard...");
  const facultyAuth = await getAuthToken("faculty.makers@university.edu", "password123", "faculty");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, facultyAuth);
  await page.goto(`${BASE_URL}/faculty`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig11_faculty_dashboard.png") });

  // 8. Login as Admin
  console.log("Capturing Figure 12: Admin Dashboard...");
  const adminAuth = await getAuthToken("admin@university.edu", "", "admin", "123456");
  await page.evaluate((auth) => {
    localStorage.setItem("token", auth.token);
    localStorage.setItem("user", JSON.stringify(auth.user));
  }, adminAuth);
  await page.goto(`${BASE_URL}/admin`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig12_admin_dashboard.png") });

  // 9. Figure 13: Penalties Management
  console.log("Capturing Figure 13: Penalties Management...");
  await page.goto(`${BASE_URL}/penalties`, { waitUntil: "networkidle2" });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, "fig13_penalties.png") });

  await browser.close();
  console.log("All 8 screenshots successfully captured into assets/screenshots!");
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
