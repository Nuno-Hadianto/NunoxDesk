# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: e2e.spec.js >> nuNox_servis UI Black-box testing >> Clicking Tambah Pelanggan button should open modal
- Location: __tests__\e2e.spec.js:57:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for locator('#btn-add-customer')
    - locator resolved to <button id="btn-add-customer" class="btn btn-primary">Tambah Pelanggan</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is not visible
    - retrying click action
      - waiting 100ms
    59 × waiting for element to be visible, enabled and stable
       - element is not visible
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - heading "nuNox Servis" [level=2] [ref=f1e3]
  - generic [ref=f1e4]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]: Username
      - textbox "Masukkan username" [ref=f1e7]
    - generic [ref=f1e8]:
      - generic [ref=f1e9]: Password
      - textbox "Masukkan password" [ref=f1e10]
    - button "Masuk" [ref=f1e11] [cursor=pointer]
  - paragraph [ref=f1e12]: "Default admin: admin / admin123"
```

# Test source

```ts
  1  | const { _electron: electron } = require('@playwright/test');
  2  | const { test, expect } = require('@playwright/test');
  3  | const path = require('path');
  4  | 
  5  | test.describe('nuNox_servis UI Black-box testing', () => {
  6  |   let electronApp;
  7  |   let window;
  8  | 
  9  |   test.beforeAll(async () => {
  10 |     // Launch Electron app
  11 |     electronApp = await electron.launch({
  12 |       args: [path.join(__dirname, '..', 'electron', 'main.js')],
  13 |       // Ensure we use the test database
  14 |       env: { ...process.env, NODE_ENV: 'test' }
  15 |     });
  16 |     // Wait for the first BrowserWindow
  17 |     window = await electronApp.firstWindow();
  18 |     await window.waitForLoadState('domcontentloaded');
  19 |     // Give it a tiny bit of time for app.js scripts to attach
  20 |     await window.waitForTimeout(500);
  21 |   });
  22 | 
  23 |   test.afterAll(async () => {
  24 |     // Close app
  25 |     await electronApp.close();
  26 |   });
  27 | 
  28 |   test('App should launch with correct title', async () => {
  29 |     const title = await window.title();
  30 |     expect(title).toBe('nuNox_servis - Dashboard');
  31 |   });
  32 | 
  33 |   test('Sidebar should contain navigation links', async () => {
  34 |     // Verify sidebar exists
  35 |     const sidebar = window.locator('.sidebar');
  36 |     await expect(sidebar).toBeVisible();
  37 | 
  38 |     // Verify Dashboard link exists
  39 |     const dashboardLink = window.locator('#nav-dashboard');
  40 |     await expect(dashboardLink).toBeVisible();
  41 |     await expect(dashboardLink).toContainText('Dashboard');
  42 |   });
  43 | 
  44 |   test('Clicking Pelanggan menu should switch to Customer View', async () => {
  45 |     const customerLink = window.locator('#nav-customers');
  46 |     await customerLink.click();
  47 | 
  48 |     const customerView = window.locator('#view-customers');
  49 |     // It should become visible (display: block)
  50 |     await expect(customerView).toBeVisible();
  51 | 
  52 |     // The header #page-title should change to "Data Pelanggan" (or something similar depending on your app.js)
  53 |     const pageTitle = window.locator('#page-title');
  54 |     await expect(pageTitle).toContainText('Pelanggan');
  55 |   });
  56 | 
  57 |   test('Clicking Tambah Pelanggan button should open modal', async () => {
  58 |     // Click Tambah Pelanggan
  59 |     const addCustomerBtn = window.locator('#btn-add-customer');
> 60 |     await addCustomerBtn.click();
     |                          ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  61 | 
  62 |     // Modal should appear
  63 |     const modal = window.locator('#customer-modal');
  64 |     await expect(modal).toBeVisible();
  65 | 
  66 |     // There should be an input for Customer Name
  67 |     const nameInput = window.locator('#customer-name');
  68 |     await expect(nameInput).toBeVisible();
  69 | 
  70 |     // Close the modal to clean up
  71 |     const closeBtn = modal.locator('.close-modal').first();
  72 |     await closeBtn.click();
  73 |   });
  74 | });
  75 | 
```