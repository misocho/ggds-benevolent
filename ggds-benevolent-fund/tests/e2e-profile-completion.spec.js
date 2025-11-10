const { test, expect } = require('@playwright/test');

test.describe('PIVOT v2.0 Profile Completion Flow', () => {
  test('Admin creates member, member completes profile and changes password', async ({ page }) => {
    // Step 1: Admin Login
    console.log('Step 1: Admin login...');
    await page.goto('http://localhost:3000');
    await page.fill('input[type="email"]', 'admin@ggds.com');
    await page.fill('input[type="password"]', 'Admin123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 });
    console.log('✓ Admin logged in successfully');

    // Step 2: Create new member
    console.log('Step 2: Creating new member...');
    await page.goto('http://localhost:3000/admin/dashboard/members');
    await page.click('text=Create New Member');

    const timestamp = Date.now();
    const testEmail = `test${timestamp}@example.com`;

    await page.fill('input[name="full_name"]', 'Test Member');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="phone"]', '+254700000000');
    await page.click('button[type="submit"]:has-text("Create Member")');

    await page.waitForTimeout(2000);
    console.log(`✓ Member created with email: ${testEmail}`);

    // Step 3: Logout admin
    console.log('Step 3: Logging out admin...');
    await page.click('button:has-text("Logout")');
    await page.waitForURL('**/');
    console.log('✓ Admin logged out');

    // Step 4: Member login with temporary password
    console.log('Step 4: Member login with temporary password...');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'TempPass123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/complete-profile', { timeout: 10000 });
    console.log('✓ Member logged in, redirected to profile completion');

    // Step 5: Complete profile - Personal Details
    console.log('Step 5: Filling personal details...');
    await page.fill('input[name="date_of_birth"]', '1990-01-01');
    await page.fill('input[name="id_number"]', '12345678');
    await page.fill('input[name="occupation"]', 'Software Engineer');
    await page.fill('input[name="residence"]', 'Nairobi');
    await page.click('button:has-text("Next")');
    console.log('✓ Personal details completed');

    // Step 6: Parents
    console.log('Step 6: Adding parent...');
    await page.fill('input[name="parents.0.name"]', 'Parent Name');
    await page.fill('input[name="parents.0.date_of_birth"]', '1960-01-01');
    await page.click('button:has-text("Next")');
    console.log('✓ Parent added');

    // Step 7: Nuclear Family (optional - skip)
    console.log('Step 7: Skipping nuclear family...');
    await page.click('button:has-text("Next")');
    console.log('✓ Nuclear family skipped');

    // Step 8: Siblings (optional - skip)
    console.log('Step 8: Skipping siblings...');
    await page.click('button:has-text("Next")');
    console.log('✓ Siblings skipped');

    // Step 9: Next of Kin
    console.log('Step 9: Adding next of kin...');
    await page.fill('input[name="next_of_kin.0.name"]', 'Next Of Kin Name');
    await page.fill('input[name="next_of_kin.0.phone"]', '+254700111111');
    await page.fill('input[name="next_of_kin.0.relationship"]', 'Sibling');
    await page.click('button:has-text("Next")');
    console.log('✓ Next of kin added');

    // Step 10: Review and Submit
    console.log('Step 10: Reviewing and submitting...');
    await page.click('button:has-text("Submit Profile")');
    await page.waitForURL('**/change-password', { timeout: 10000 });
    console.log('✓ Profile submitted, redirected to change password');

    // Step 11: Change password
    console.log('Step 11: Changing password...');
    await page.fill('input[name="current_password"]', 'TempPass123!');
    await page.fill('input[name="new_password"]', 'NewPass123!');
    await page.fill('input[name="confirm_password"]', 'NewPass123!');
    await page.click('button:has-text("Change Password")');
    await page.waitForURL('**/dashboard', { timeout: 10000 });
    console.log('✓ Password changed, redirected to dashboard');

    // Step 12: Verify member is on dashboard
    console.log('Step 12: Verifying dashboard access...');
    await expect(page).toHaveURL(/.*dashboard/);
    console.log('✓ Member successfully accessed dashboard');

    console.log('\n✅ ALL TESTS PASSED - End-to-end flow completed successfully!');
  });
});
