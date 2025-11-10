const { test, expect } = require('@playwright/test')

test.describe('Profile Completion with Covered Persons', () => {
  let adminToken
  let memberEmail
  let memberPassword

  test.beforeAll(async ({ request }) => {
    // Admin login to create test member
    const adminLoginResponse = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        email: 'admin@ggds.com',
        password: 'admin123'
      }
    })

    expect(adminLoginResponse.ok()).toBeTruthy()
    const adminLoginData = await adminLoginResponse.json()
    adminToken = adminLoginData.access_token

    // Create a test member
    memberEmail = `test.member.${Date.now()}@example.com`
    memberPassword = 'GGDS2024' // Simple password from recent changes

    const createMemberResponse = await request.post('http://localhost:8000/api/admin/members/create', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: 'Test Member Coverage',
        email: memberEmail,
        phone: '+254700000999',
        role: 'member'
      }
    })

    expect(createMemberResponse.ok()).toBeTruthy()
  })

  test('should complete profile with all steps including covered persons', async ({ page }) => {
    // 1. Login as the new member
    await page.goto('http://localhost:3000/signin')
    await page.fill('input[type="email"]', memberEmail)
    await page.fill('input[type="password"]', memberPassword)
    await page.click('button[type="submit"]')

    // Wait for redirect to complete-profile
    await page.waitForURL('**/complete-profile')
    await expect(page.locator('h1')).toContainText('Complete Your Profile')

    // 2. Step 1: Personal Details
    await page.fill('input[name="date_of_birth"], input[type="date"]', '1990-01-15')
    await page.fill('input[placeholder*="ID"], input[placeholder*="Passport"]', '12345678')
    await page.fill('input[placeholder*="Occupation"]', 'Software Engineer')
    await page.fill('input[placeholder*="Residence"]', 'Nairobi')
    await page.click('button:has-text("Next")')

    // 3. Step 2: Parents (optional - add one parent)
    await page.waitForTimeout(500)
    const parentNameInput = page.locator('input[placeholder*="full name"]').first()
    await parentNameInput.fill('John Doe Senior')
    const parentDobInput = page.locator('input[type="date"]').first()
    await parentDobInput.fill('1960-05-20')
    await page.click('button:has-text("Next")')

    // 4. Step 3: Nuclear Family (add spouse and child)
    await page.waitForTimeout(500)

    // Add spouse
    const spouseNameInput = page.locator('input[placeholder*="full name"]').first()
    await spouseNameInput.fill('Jane Doe')
    const spouseRelationship = page.locator('select').first()
    await spouseRelationship.selectOption('spouse')
    const spouseDob = page.locator('input[type="date"]').first()
    await spouseDob.fill('1992-03-10')

    // Add another family member (child)
    await page.click('button:has-text("Add")')
    await page.waitForTimeout(300)

    const childNameInput = page.locator('input[placeholder*="full name"]').nth(1)
    await childNameInput.fill('Baby Doe')
    const childRelationship = page.locator('select').nth(1)
    await childRelationship.selectOption('child')
    const childDob = page.locator('input[type="date"]').nth(1)
    await childDob.fill('2020-08-15')

    await page.click('button:has-text("Next")')

    // 5. Step 4: Siblings (add one sibling)
    await page.waitForTimeout(500)
    const siblingNameInput = page.locator('input[placeholder*="full name"]').first()
    await siblingNameInput.fill('Sarah Doe')
    const siblingRelationship = page.locator('select').first()
    await siblingRelationship.selectOption('sister')
    const siblingDob = page.locator('input[type="date"]').first()
    await siblingDob.fill('1995-12-05')
    await page.click('button:has-text("Next")')

    // 6. Step 5: Covered Persons (NEW FEATURE - add insured individuals)
    await page.waitForTimeout(500)
    await expect(page.locator('h2')).toContainText('Covered Persons')

    // Add first covered person
    const coveredPerson1Name = page.locator('input[placeholder*="full name"]').first()
    await coveredPerson1Name.fill('Covered Child One')
    const coveredPerson1Relationship = page.locator('input[placeholder*="Spouse, Parent"]').first()
    await coveredPerson1Relationship.fill('Dependent Child')
    const coveredPerson1Dob = page.locator('input[type="date"]').first()
    await coveredPerson1Dob.fill('2018-06-20')
    const coveredPerson1IdNumber = page.locator('input[placeholder*="Optional ID"]').first()
    await coveredPerson1IdNumber.fill('ID123456')

    // Add second covered person
    await page.click('button:has-text("Add Person")')
    await page.waitForTimeout(300)

    const coveredPerson2Name = page.locator('input[placeholder*="full name"]').nth(1)
    await coveredPerson2Name.fill('Covered Parent')
    const coveredPerson2Relationship = page.locator('input[placeholder*="Spouse, Parent"]').nth(1)
    await coveredPerson2Relationship.fill('Elderly Parent')
    const coveredPerson2Dob = page.locator('input[type="date"]').nth(1)
    await coveredPerson2Dob.fill('1955-03-15')

    await page.click('button:has-text("Next")')

    // 7. Step 6: Next of Kin (single beneficiary with percentage)
    await page.waitForTimeout(500)
    await expect(page.locator('h2')).toContainText('Next of Kin')

    // Check for spouse default warning
    await expect(page.locator('text=If no next of kin is specified')).toBeVisible()

    const nokName = page.locator('input[placeholder*="name"]').first()
    await nokName.fill('Emergency Contact Person')
    const nokRelationship = page.locator('input[placeholder*="relationship"]').first()
    await nokRelationship.fill('Sister')
    const nokPhone = page.locator('input[placeholder*="phone"]').first()
    await nokPhone.fill('+254700111222')
    const nokEmail = page.locator('input[type="email"]').first()
    await nokEmail.fill('emergency@example.com')

    // Verify percentage field (should default to 100)
    const nokPercentage = page.locator('input[type="number"]').first()
    await expect(nokPercentage).toHaveValue('100')

    await page.click('button:has-text("Next")')

    // 8. Step 7: Review all information
    await page.waitForTimeout(500)
    await expect(page.locator('h2')).toContainText('Review Your Information')

    // Verify all sections are visible
    await expect(page.locator('text=Personal Details')).toBeVisible()
    await expect(page.locator('text=John Doe Senior')).toBeVisible() // Parent
    await expect(page.locator('text=Jane Doe')).toBeVisible() // Spouse
    await expect(page.locator('text=Baby Doe')).toBeVisible() // Child
    await expect(page.locator('text=Sarah Doe')).toBeVisible() // Sibling

    // Verify covered persons section
    await expect(page.locator('text=Covered Persons')).toBeVisible()
    await expect(page.locator('text=Covered Child One')).toBeVisible()
    await expect(page.locator('text=Covered Parent')).toBeVisible()

    // Verify next of kin
    await expect(page.locator('text=Emergency Contact Person')).toBeVisible()
    await expect(page.locator('text=100% Benefit')).toBeVisible()

    // 9. Submit the profile
    await page.click('button:has-text("Complete Profile")')

    // Wait for success and redirect to change password
    await page.waitForURL('**/change-password', { timeout: 10000 })
    await expect(page.locator('h1, h2')).toContainText('Change Password')
  })

  test('should display covered persons in dashboard after profile completion', async ({ page }) => {
    // Login as member
    await page.goto('http://localhost:3000/signin')
    await page.fill('input[type="email"]', memberEmail)
    await page.fill('input[type="password"]', memberPassword)
    await page.click('button[type="submit"]')

    // If redirected to change password, change it first
    const currentUrl = await page.url()
    if (currentUrl.includes('change-password')) {
      await page.fill('input[placeholder*="current"]', memberPassword)
      await page.fill('input[placeholder*="new"]', 'NewPassword123!')
      await page.fill('input[placeholder*="confirm"]', 'NewPassword123!')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(1000)

      // Login again with new password
      await page.goto('http://localhost:3000/signin')
      await page.fill('input[type="email"]', memberEmail)
      await page.fill('input[type="password"]', 'NewPassword123!')
      await page.click('button[type="submit"]')
    }

    // Wait for dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Verify covered persons section exists
    await expect(page.locator('h3:has-text("Covered Persons")')).toBeVisible()

    // Verify covered persons are displayed
    await expect(page.locator('text=Covered Child One')).toBeVisible()
    await expect(page.locator('text=Dependent Child')).toBeVisible()
    await expect(page.locator('text=Covered Parent')).toBeVisible()
    await expect(page.locator('text=Elderly Parent')).toBeVisible()
  })

  test('should allow member to add more covered persons via API', async ({ request }) => {
    // Login to get member token
    const loginResponse = await request.post('http://localhost:8000/api/auth/login', {
      data: {
        email: memberEmail,
        password: 'NewPassword123!' // Use new password if changed
      }
    })

    let memberToken
    if (loginResponse.ok()) {
      const loginData = await loginResponse.json()
      memberToken = loginData.access_token
    } else {
      // Try with original password
      const loginRetry = await request.post('http://localhost:8000/api/auth/login', {
        data: {
          email: memberEmail,
          password: memberPassword
        }
      })
      expect(loginRetry.ok()).toBeTruthy()
      const loginData = await loginRetry.json()
      memberToken = loginData.access_token
    }

    // Add a new covered person via API
    const addCoveredPersonResponse = await request.post('http://localhost:8000/api/covered-persons', {
      headers: {
        'Authorization': `Bearer ${memberToken}`
      },
      data: {
        name: 'Additional Covered Person',
        relationship: 'Grandchild',
        date_of_birth: '2022-01-10',
        id_number: 'ID789012'
      }
    })

    expect(addCoveredPersonResponse.ok()).toBeTruthy()
    const addedPerson = await addCoveredPersonResponse.json()
    expect(addedPerson.name).toBe('Additional Covered Person')
    expect(addedPerson.relationship).toBe('Grandchild')

    // Get all covered persons
    const getCoveredPersonsResponse = await request.get('http://localhost:8000/api/covered-persons', {
      headers: {
        'Authorization': `Bearer ${memberToken}`
      }
    })

    expect(getCoveredPersonsResponse.ok()).toBeTruthy()
    const coveredPersons = await getCoveredPersonsResponse.json()
    expect(coveredPersons.length).toBeGreaterThanOrEqual(3) // At least 3 (2 from profile + 1 just added)

    // Verify the new person is in the list
    const newPerson = coveredPersons.find(p => p.name === 'Additional Covered Person')
    expect(newPerson).toBeDefined()
    expect(newPerson.relationship).toBe('Grandchild')
  })

  test('should validate covered persons fields are optional during profile completion', async ({ page, request }) => {
    // Create another test member for this scenario
    const testEmail = `test.optional.${Date.now()}@example.com`

    const createMemberResponse = await request.post('http://localhost:8000/api/admin/members/create', {
      headers: {
        'Authorization': `Bearer ${adminToken}`
      },
      data: {
        name: 'Test Optional Member',
        email: testEmail,
        phone: '+254700000888',
        role: 'member'
      }
    })

    expect(createMemberResponse.ok()).toBeTruthy()

    // Login and complete profile WITHOUT covered persons
    await page.goto('http://localhost:3000/signin')
    await page.fill('input[type="email"]', testEmail)
    await page.fill('input[type="password"]', 'GGDS2024')
    await page.click('button[type="submit"]')

    await page.waitForURL('**/complete-profile')

    // Step 1: Personal Details
    await page.fill('input[type="date"]', '1988-05-20')
    await page.fill('input[placeholder*="ID"], input[placeholder*="Passport"]', '87654321')
    await page.click('button:has-text("Next")')

    // Step 2: Parents - skip
    await page.waitForTimeout(500)
    await page.click('button:has-text("Next")')

    // Step 3: Nuclear Family - skip
    await page.waitForTimeout(500)
    await page.click('button:has-text("Next")')

    // Step 4: Siblings - skip
    await page.waitForTimeout(500)
    await page.click('button:has-text("Next")')

    // Step 5: Covered Persons - skip (should be optional)
    await page.waitForTimeout(500)
    await expect(page.locator('h2')).toContainText('Covered Persons')
    await page.click('button:has-text("Next")')

    // Step 6: Next of Kin - required
    await page.waitForTimeout(500)
    const nokName = page.locator('input[placeholder*="name"]').first()
    await nokName.fill('Emergency Contact')
    const nokRelationship = page.locator('input[placeholder*="relationship"]').first()
    await nokRelationship.fill('Friend')
    const nokPhone = page.locator('input[placeholder*="phone"]').first()
    await nokPhone.fill('+254700999888')
    await page.click('button:has-text("Next")')

    // Step 7: Review - should show "No covered persons added"
    await page.waitForTimeout(500)
    await expect(page.locator('text=No covered persons added')).toBeVisible()

    // Submit should work without covered persons
    await page.click('button:has-text("Complete Profile")')
    await page.waitForURL('**/change-password', { timeout: 10000 })
  })
})
