const { _electron: electron } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('nuNox_servis UI Black-box testing', () => {
  let electronApp;
  let window;

  test.beforeAll(async () => {
    // Launch Electron app
    electronApp = await electron.launch({
      args: [path.join(__dirname, '..', 'electron', 'main.js')],
      // Ensure we use the test database
      env: { ...process.env, NODE_ENV: 'test' }
    });
    // Wait for the first BrowserWindow
    window = await electronApp.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // Perform login since the app now requires it
    await window.fill('#login-username', 'admin');
    await window.fill('#login-password', 'admin');
    await window.click('#btn-login');
    
    // Give it time to authenticate and switch view
    await window.waitForTimeout(1000);
  });

  test.afterAll(async () => {
    // Close app
    await electronApp.close();
  });

  test('App should launch with correct title', async () => {
    const title = await window.title();
    expect(title).toBe('nuNox_servis - Dashboard');
  });

  test('Sidebar should contain navigation links', async () => {
    // Verify sidebar exists
    const sidebar = window.locator('.sidebar');
    await expect(sidebar).toBeVisible();

    // Verify Dashboard link exists
    const dashboardLink = window.locator('#nav-dashboard');
    await expect(dashboardLink).toBeVisible();
    await expect(dashboardLink).toContainText('Dashboard');
  });

  test('Clicking Pelanggan menu should switch to Customer View', async () => {
    const customerLink = window.locator('#nav-customers');
    await customerLink.click();

    const customerView = window.locator('#view-customers');
    // It should become visible (display: block)
    await expect(customerView).toBeVisible();

    // The header #page-title should change to "Data Pelanggan" (or something similar depending on your app.js)
    const pageTitle = window.locator('#page-title');
    await expect(pageTitle).toContainText('Pelanggan');
  });

  test('Clicking Tambah Pelanggan button should open modal', async () => {
    // Click Tambah Pelanggan
    const addCustomerBtn = window.locator('#btn-add-customer');
    await addCustomerBtn.click();

    // Modal should appear
    const modal = window.locator('#customer-modal');
    await expect(modal).toBeVisible();

    // There should be an input for Customer Name
    const nameInput = window.locator('#customer-name');
    await expect(nameInput).toBeVisible();

    // Close the modal to clean up
    const closeBtn = modal.locator('.close-modal').first();
    await closeBtn.click();
  });
});
