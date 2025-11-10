// @ts-check
const { test, expect } = require('@playwright/test');

// Test data
const testMember = {
  firstName: 'John',
  middleName: 'David',
  surname: 'Doe',
  phone: '+254722334455',
  email: `john.doe.test${Date.now()}@example.com`,
  // Profile completion data
  dateOfBirth: '1990-05-15',
  idNumber: 'A12345678',
  occupation: 'Software Engineer',
  residence: 'Nairobi, Kenya',
  // Password
  tempPassword: '',
  newPassword: 'SecurePass123!@#'
};

test.describe('Complete Profile Flow - End to End', () => {

  test('✅ Step 1: Admin creates new member account', async ({ page }) => {
    console.log('🔐 Logging in as admin...');

    // Navigate to signin
    await page.goto('http://localhost:3000/signin');
    await expect(page).toHaveTitle(/GGDS/);

    // Admin login
    await page.fill('input[type="email"]', 'admin@ggds.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');

    // Wait for redirect to admin dashboard
    await page.waitForURL(/\/admin\/dashboard/);
    await expect(page.locator('text=Admin Dashboard')).toBeVisible();
    console.log('✅ Admin logged in successfully');

    // Navigate to members page
    await page.click('text=Members');
    await page.waitForURL(/\/admin\/dashboard\/members/);

    // Click create member button
    await page.click('text=Create New Member');

    // Fill in member details
    await page.fill('input[placeholder*="First"]', testMember.firstName);
    await page.fill('input[placeholder*="Middle"]', testMember.middleName);
    await page.fill('input[placeholder*="Surname"]', testMember.surname);
    await page.fill('input[placeholder*="phone"]', testMember.phone);
    await page.fill('input[type="email"]', testMember.email);

    // Submit form
    await page.click('button:has-text("Create Member")');

    // Wait for success modal/message
    await expect(page.locator('text=Member created successfully')).toBeVisible({ timeout: 10000 });

    // Extract temporary password from success message
    const passwordText = await page.locator('text=/Initial Password/').textContent();
    testMember.tempPassword = passwordText.match(/:\s*([^\s]+)/)[1];

    console.log('✅ Member created successfully');
    console.log(`📧 Email: ${testMember.email}`);
    console.log(`🔑 Temp Password: ${testMember.tempPassword}`);

    // Logout admin
    await page.click('text=Logout');
  });

  test('✅ Step 2: Member logs in with temporary password', async ({ page }) => {
    console.log('🔐 Logging in as member with temp password...');

    // Navigate to signin
    await page.goto('http://localhost:3000/signin');

    // Member login
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');

    // Should redirect to complete profile page
    await page.waitForURL(/\/complete-profile/, { timeout: 10000 });
    await expect(page.locator('text=Complete Your Profile')).toBeVisible();

    console.log('✅ Member logged in, redirected to profile completion');
  });

  test('✅ Step 3: Complete profile - Personal Details (Step 1/6)', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    console.log('📝 Filling personal details...');

    // Fill personal details
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.fill('input[placeholder*="occupation"]', testMember.occupation);
    await page.fill('input[placeholder*="address"]', testMember.residence);

    // Click Next
    await page.click('button:has-text("Next")');

    // Should move to step 2
    await expect(page.locator('text=Parents')).toBeVisible();
    console.log('✅ Personal details completed');
  });

  test('✅ Step 4: Complete profile - Parents (Step 2/6)', async ({ page }) => {
    // Login and navigate to step 2
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    // Navigate to step 2
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.click('button:has-text("Next")');

    console.log('👨‍👩‍👦 Adding parents...');

    // Add first parent
    await page.fill('input[placeholder*="full name"]', 'Jane Doe');
    await page.fill('input[type="date"]', '1965-03-20');

    // Add second parent
    await page.click('button:has-text("Add Parent")');
    const nameInputs = await page.locator('input[placeholder*="full name"]').all();
    await nameInputs[1].fill('James Doe');
    const dateInputs = await page.locator('input[type="date"]').all();
    await dateInputs[1].fill('1963-08-10');

    // Click Next
    await page.click('button:has-text("Next")');

    await expect(page.locator('text=Nuclear Family')).toBeVisible();
    console.log('✅ Parents added');
  });

  test('✅ Step 5: Complete profile - Nuclear Family (Step 3/6)', async ({ page }) => {
    // Login and navigate to step 3
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    // Navigate through steps
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")'); // Skip parents

    console.log('👨‍👩‍👧‍👦 Adding nuclear family...');

    // Add spouse
    await page.fill('input[placeholder*="full name"]', 'Mary Doe');
    await page.selectOption('select', 'spouse');
    await page.fill('input[type="date"]', '1992-07-25');

    // Click Next
    await page.click('button:has-text("Next")');

    console.log('✅ Nuclear family added');
  });

  test('✅ Step 6: Complete profile - Siblings (Step 4/6)', async ({ page }) => {
    // Login and navigate to step 4
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    // Navigate through steps
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    console.log('👫 Adding siblings...');

    // Add sibling
    await page.fill('input[placeholder*="full name"]', 'Alice Doe');
    await page.selectOption('select', 'sister');
    await page.fill('input[type="date"]', '1995-11-30');

    // Click Next
    await page.click('button:has-text("Next")');

    console.log('✅ Siblings added');
  });

  test('✅ Step 7: Complete profile - Next of Kin (Step 5/6)', async ({ page }) => {
    // Login and navigate to step 5
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    // Navigate through steps
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Next")');

    console.log('📞 Adding next of kin...');

    // Fill primary next of kin
    const nameInputs = await page.locator('input[placeholder*="full name"]').all();
    await nameInputs[0].fill('Robert Smith');
    const relationInputs = await page.locator('input[placeholder*="Spouse"]').all();
    await relationInputs[0].fill('Brother');
    const phoneInputs = await page.locator('input[placeholder*="+254"]').all();
    await phoneInputs[0].fill('+254711222333');

    // Click Next
    await page.click('button:has-text("Next")');

    await expect(page.locator('text=Review Your Information')).toBeVisible();
    console.log('✅ Next of kin added');
  });

  test('✅ Step 8: Review and submit profile', async ({ page }) => {
    // Login and complete all steps
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/complete-profile/);

    console.log('🔄 Completing all steps...');

    // Step 1: Personal Details
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    await page.fill('input[placeholder*="occupation"]', testMember.occupation);
    await page.fill('input[placeholder*="address"]', testMember.residence);
    await page.click('button:has-text("Next")');

    // Step 2: Skip parents
    await page.click('button:has-text("Next")');

    // Step 3: Skip nuclear family
    await page.click('button:has-text("Next")');

    // Step 4: Skip siblings
    await page.click('button:has-text("Next")');

    // Step 5: Next of kin
    const nameInputs = await page.locator('input[placeholder*="full name"]').all();
    await nameInputs[0].fill('Emergency Contact');
    const relationInputs = await page.locator('input[placeholder*="Spouse"]').all();
    await relationInputs[0].fill('Friend');
    const phoneInputs = await page.locator('input[placeholder*="+254"]').all();
    await phoneInputs[0].fill('+254799888777');
    await page.click('button:has-text("Next")');

    // Step 6: Review and submit
    await expect(page.locator('text=Review Your Information')).toBeVisible();
    console.log('📋 Reviewing information...');

    // Submit profile
    await page.click('button:has-text("Complete Profile")');

    // Should redirect to change password page
    await page.waitForURL(/\/change-password/, { timeout: 10000 });
    await expect(page.locator('text=Change Your Password')).toBeVisible();

    console.log('✅ Profile submitted successfully');
  });

  test('✅ Step 9: Change password', async ({ page }) => {
    // Login and complete profile to reach change password
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.tempPassword);
    await page.click('button[type="submit"]');

    // Quick profile completion
    await page.waitForURL(/\/complete-profile/);
    await page.fill('input[type="date"]', testMember.dateOfBirth);
    await page.fill('input[placeholder*="ID"]', testMember.idNumber);
    for (let i = 0; i < 4; i++) await page.click('button:has-text("Next")');

    const nameInputs = await page.locator('input[placeholder*="full name"]').all();
    await nameInputs[0].fill('Emergency Contact');
    const relationInputs = await page.locator('input[placeholder*="Spouse"]').all();
    await relationInputs[0].fill('Friend');
    const phoneInputs = await page.locator('input[placeholder*="+254"]').all();
    await phoneInputs[0].fill('+254799888777');
    await page.click('button:has-text("Next")');
    await page.click('button:has-text("Complete Profile")');

    await page.waitForURL(/\/change-password/);

    console.log('🔐 Changing password...');

    // Fill password change form
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill(testMember.tempPassword); // Current
    await passwordInputs[1].fill(testMember.newPassword); // New
    await passwordInputs[2].fill(testMember.newPassword); // Confirm

    // Submit
    await page.click('button:has-text("Change Password")');

    // Should redirect to dashboard
    await page.waitForURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Member Dashboard')).toBeVisible();

    console.log('✅ Password changed successfully');
  });

  test('✅ Step 10: Verify dashboard access and profile completion', async ({ page }) => {
    console.log('🏠 Verifying dashboard access...');

    // Login with new password
    await page.goto('http://localhost:3000/signin');
    await page.fill('input[type="email"]', testMember.email);
    await page.fill('input[type="password"]', testMember.newPassword);
    await page.click('button[type="submit"]');

    // Should go to dashboard (not profile completion)
    await page.waitForURL(/\/dashboard/);
    await expect(page.locator('text=Member Dashboard')).toBeVisible();

    // Navigate to profile tab
    await page.click('text=My Profile');

    // Should show profile completed badge
    await expect(page.locator('text=Profile Completed')).toBeVisible();

    // Verify personal details are displayed
    await expect(page.locator(`text=${testMember.idNumber}`)).toBeVisible();
    await expect(page.locator(`text=${testMember.occupation}`)).toBeVisible();

    console.log('✅ Dashboard access confirmed');
    console.log('✅ Profile completion verified');
    console.log('\n🎉 ALL TESTS PASSED! Complete profile flow works end-to-end');
  });
});
