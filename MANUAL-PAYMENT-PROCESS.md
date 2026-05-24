# Manual Payment Process - Alternative to Stripe

## Overview
For customers who pay via MOSCA Marketplace, crypto, wire transfer, or other non-Stripe methods, this document outlines the manual account creation and management process.

---

## Payment Methods Supported

### 1. MOSCA Marketplace ⭐
- Payment processed within MOSCA ecosystem
- Instant confirmation available
- No credit card fees
- Native MOSCA token acceptance

### 2. Cryptocurrency
- Bitcoin (BTC)
- Ethereum (ETH)
- USDT/USDC (Stablecoins)
- MOSCA Token

### 3. Traditional Alternatives
- Wire transfer
- ACH/Bank transfer
- PayPal (friends/family)
- Zelle
- Cash App
- Venmo

### 4. International
- Western Union
- MoneyGram
- Bank wire (SWIFT)
- Local payment processors

---

## Manual Account Creation Process

### Step 1: Payment Verification

**Before creating any account, VERIFY payment has been received:**

1. **MOSCA Marketplace:**
   - Check MOSCA transaction history
   - Verify transaction ID
   - Confirm amount matches product price
   - Screenshot transaction for records

2. **Cryptocurrency:**
   - Check blockchain explorer
   - Verify wallet address received funds
   - Confirm transaction has 6+ confirmations
   - Screenshot transaction hash

3. **Traditional:**
   - Check bank account/payment processor
   - Verify sender details match customer info
   - Confirm amount received (minus fees if applicable)
   - Save transaction receipt/statement

**CRITICAL**: Do NOT create account until payment is 100% confirmed and irreversible.

---

## Step 2: Determine Product Type

Based on payment amount, identify which product was purchased:

| Product | Price | Account Type |
|---------|-------|--------------|
| Team Admin | $497 | Team Admin (recurring) |
| Standalone Team Admin | $497 | Team Admin (independent) |
| Organization Admin | $997 | Organization Admin |
| White-Label (Promo) | $1,997 | White-Label Main Admin |
| White-Label (Regular) | $2,997 | White-Label Main Admin |

---

## Step 3: Create Account via Database Script

### Option A: Use Admin Panel (Recommended)

**Main Admin Dashboard has these buttons:**
1. **+ Add Admin** - For Team Admin / Organization Admin
2. **+ Add Strategic Partner** - For creating Strategic Partners

**Steps:**
1. Login as Main Admin: https://hub.citizenactivation.com/login
2. Click appropriate "+ Add" button
3. Fill in customer details:
   - First Name
   - Last Name
   - Email
   - Phone (optional)
   - Initial password (send to customer securely)
4. Save

**Important Notes:**
- For White-Label accounts, use "+ Add Admin" then manually upgrade role
- Team will be auto-assigned based on your Main Admin context
- Send login credentials via secure method (encrypted email, Signal, etc.)

---

### Option B: Database Script (Advanced)

For White-Label accounts or bulk operations, use database script:

**Create script file**: `scripts/create-manual-account.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function createManualAccount() {
  // CONFIGURATION - UPDATE THESE VALUES
  const accountType = 'white_label' // 'team_admin', 'org_admin', 'white_label'
  const customerInfo = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'customer@example.com',
    phone: '+1234567890',
    password: 'TempPassword123!', // Send this securely to customer
  }
  const paymentInfo = {
    method: 'MOSCA_MARKETPLACE', // or 'CRYPTO_BTC', 'WIRE_TRANSFER', etc.
    amount: 1997,
    transactionId: 'MOSCA-TX-12345',
    datePaid: new Date(),
  }

  try {
    const passwordHash = await bcrypt.hash(customerInfo.password, 10)

    if (accountType === 'white_label') {
      // Create White-Label Main Admin
      const team = await prisma.team.create({
        data: {
          name: `${customerInfo.firstName}'s System`,
          tierType: 'WhiteLabel',
          status: 'Active',
          slotsAvailable: 999, // Unlimited for white-label
          createdDate: new Date(),
        }
      })

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'MAIN_ADMIN',
          status: 'Active',
          teamId: team.id,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('✅ White-Label account created!')
      console.log('Team ID:', team.id)
      console.log('Admin ID:', admin.id)
      console.log('Login URL: https://hub.citizenactivation.com/login')
      console.log('Email:', customerInfo.email)
      console.log('Temporary Password:', customerInfo.password)
      console.log('\n⚠️ IMPORTANT: Send credentials securely to customer!')
    }

    if (accountType === 'org_admin') {
      // Create Organization Admin (similar to white-label but different tier)
      const team = await prisma.team.create({
        data: {
          name: `${customerInfo.firstName}'s Organization`,
          tierType: 'OrganizationLevel',
          status: 'Active',
          slotsAvailable: 50,
          createdDate: new Date(),
        }
      })

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'TEAM_ADMIN',
          status: 'Active',
          teamId: team.id,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('✅ Organization Admin created!')
      console.log('Team ID:', team.id)
      console.log('Admin ID:', admin.id)
    }

    if (accountType === 'team_admin') {
      // Add to existing team (requires teamId)
      const teamId = 'YOUR_MAIN_TEAM_ID' // Update this

      const admin = await prisma.admin.create({
        data: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
          passwordHash: passwordHash,
          role: 'TEAM_ADMIN',
          status: 'Active',
          teamId: teamId,
          notes: `Manual payment: ${paymentInfo.method} - ${paymentInfo.transactionId} - $${paymentInfo.amount} on ${paymentInfo.datePaid.toISOString()}`,
        }
      })

      console.log('✅ Team Admin created!')
      console.log('Admin ID:', admin.id)
    }

  } catch (error) {
    console.error('❌ Error creating account:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createManualAccount()
```

**Run the script:**
```bash
cd /root/.openclaw/workspace/citizen-activation-system
node scripts/create-manual-account.js
```

---

## Step 4: Send Credentials to Customer

**SECURE delivery methods (choose one):**

1. **Encrypted Email** (ProtonMail, Tutanota)
2. **Signal/WhatsApp** (with disappearing messages)
3. **Telegram Secret Chat**
4. **Password manager share** (1Password, Bitwarden)
5. **Phone call + SMS** (password via call, link via SMS)

**Message Template:**

```
Subject: Your Citizen Activation System Account - Login Details

Hi [First Name],

Your payment of $[amount] via [payment method] has been confirmed!

Your account is now active:

🔗 Login URL: https://hub.citizenactivation.com/login
📧 Email: [customer email]
🔑 Temporary Password: [generated password]

⚠️ IMPORTANT: 
1. Login immediately and change your password
2. Go to Profile → Change Password
3. Use a strong, unique password

Your Account Type: [White-Label / Organization Admin / Team Admin]

Need help getting started?
- Dashboard tutorial: [link]
- Support: [contact method]

Welcome to the Citizen Activation System!

[Your Name]
[Your Title]
```

---

## Step 5: Record Payment in Tracking Sheet

**Create a Google Sheet or Excel file**: `Manual_Payments_Tracker.xlsx`

**Columns:**
| Date | Customer Name | Email | Product | Amount | Payment Method | Transaction ID | Account Created | Notes |
|------|---------------|-------|---------|--------|----------------|----------------|-----------------|-------|
| 2026-05-24 | John Doe | john@example.com | White-Label | $1,997 | MOSCA Marketplace | MOSCA-TX-12345 | ✅ Yes | Sent credentials via Signal |

**Benefits:**
- Audit trail for all manual payments
- Easy reference for renewals
- Track which customers paid via alternative methods
- Helps with annual renewal invoicing

---

## Annual Renewal Process (Manual Payments)

### 30 Days Before Renewal Due:

**Step 1: Send Renewal Invoice**

Create invoice with:
- Customer name and email
- Product: [White-Label / Org Admin / Team Admin] Annual Renewal
- Amount: $997 (White-Label) or $497 (others)
- Due date: [renewal date]
- Payment options:
  - MOSCA Marketplace: [instructions/link]
  - Crypto: [wallet addresses]
  - Wire transfer: [bank details]
  - Other: [contact for options]

**Invoice Template** saved at: `templates/renewal-invoice-template.pdf`

---

### Step 2: Payment Reminder Schedule

- **Day 30**: Initial invoice sent
- **Day 15**: Friendly reminder
- **Day 7**: Second reminder
- **Day 3**: Final notice
- **Day 0**: Account suspended (grace period starts)
- **Day 7 overdue**: Account disabled

**Automated reminders** (optional):
- Set calendar reminders
- Use Zapier/Make.com for email automation
- Track in renewal spreadsheet

---

### Step 3: Upon Receiving Renewal Payment

1. **Verify payment** (same as initial process)
2. **Update account status** (if suspended)
3. **Extend renewal date** by 1 year in database
4. **Send confirmation email**
5. **Update tracking sheet**

**Database update script**: `scripts/extend-renewal.js`

```javascript
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function extendRenewal() {
  const adminEmail = 'customer@example.com'
  const renewalDate = new Date()
  renewalDate.setFullYear(renewalDate.getFullYear() + 1) // Add 1 year

  const admin = await prisma.admin.update({
    where: { email: adminEmail },
    data: {
      status: 'Active',
      // Add renewal date field if you have one
      notes: `Renewal paid manually on ${new Date().toISOString()} - Next renewal: ${renewalDate.toISOString()}`,
    }
  })

  console.log('✅ Renewal processed for:', admin.email)
  console.log('Next renewal date:', renewalDate.toISOString())
}

extendRenewal().catch(console.error).finally(() => prisma.$disconnect())
```

---

## MOSCA Marketplace Integration (Future)

### Phase 1: Manual Process (Current)
- Customer pays in MOSCA Marketplace
- You verify transaction manually
- You create account via script/admin panel

### Phase 2: Semi-Automated (Coming Soon)
- MOSCA webhook sends payment notification
- You review and approve
- Script auto-creates account after approval

### Phase 3: Fully Automated (Future)
- MOSCA webhook triggers account creation
- Automatic credential delivery
- Instant activation
- Same UX as Stripe checkout

**Webhook endpoint** (prepare for future): `/api/webhooks/mosca-marketplace`

---

## Alternative Payment Wallet Addresses

### Cryptocurrency Wallets

**Bitcoin (BTC):**
```
[Your BTC wallet address]
```

**Ethereum (ETH):**
```
[Your ETH wallet address]
```

**USDT/USDC (ERC-20):**
```
[Your USDT/USDC wallet address]
```

**MOSCA Token:**
```
[Your MOSCA wallet address]
```

**Important:**
- Never reuse addresses (generate new for each customer)
- Use HD wallets for tracking
- Verify network (ETH mainnet, BSC, Polygon, etc.)
- Wait for sufficient confirmations before activating

---

## Wire Transfer / Bank Details

**For international customers:**

```
Bank Name: [Your Bank]
Account Name: [Business Name]
Account Number: [Number]
Routing Number (US): [Routing]
SWIFT Code (International): [SWIFT]
Bank Address: [Address]

Reference/Memo: Customer name + "CAS-WL" or "CAS-TA"
```

**Important:**
- Include unique reference for each customer
- Verify sender bank details match customer info
- Account for wire fees (customer pays or you absorb)
- International wires take 3-5 business days

---

## Customer Support for Manual Payments

### Common Questions:

**"How long until my account is active?"**
→ Within 24 hours of payment confirmation (usually same day)

**"I paid via MOSCA, when do I get access?"**
→ We verify your MOSCA transaction and activate within 4 hours during business hours

**"Can I pay in Bitcoin?"**
→ Yes! Send to [BTC address]. Wait for 6 confirmations, then notify us with transaction hash

**"I don't have a credit card, what are my options?"**
→ MOSCA Marketplace, crypto, wire transfer, or contact us for more options

**"How do renewals work for manual payments?"**
→ We'll invoice you 30 days before renewal. Pay via same method or switch to auto-billing

---

## Security Best Practices

### Payment Verification
- ✅ Always verify payment before account creation
- ✅ Check transaction is irreversible (especially crypto)
- ✅ Confirm amount matches product price
- ✅ Save proof of payment (screenshots, confirmations)

### Credential Delivery
- ✅ Use encrypted communication channels
- ✅ Never send passwords via plain email
- ✅ Temporary passwords only (force change on first login)
- ✅ Verify email address before sending credentials

### Record Keeping
- ✅ Document every manual payment in tracking sheet
- ✅ Save transaction IDs/proof
- ✅ Note payment method and date
- ✅ Track renewal dates

---

## Troubleshooting

### "Customer paid but I can't verify"
1. Check correct wallet/account
2. Verify amount is exact (watch for fees)
3. Check payment memo/reference
4. Contact customer for transaction proof
5. Use blockchain explorer for crypto

### "Account creation failed"
1. Check email isn't already registered
2. Verify team exists (for Team Admin)
3. Check database connection
4. Review error logs
5. Try via admin panel instead of script

### "Customer didn't receive credentials"
1. Check spam/junk folder
2. Verify email address is correct
3. Try alternative contact method
4. Resend via different channel
5. Manually reset password if needed

---

## Checklist for Manual Account Setup

**Pre-Payment:**
- [ ] Payment method provided to customer
- [ ] Invoice sent (if applicable)
- [ ] Wallet addresses verified (for crypto)

**Payment Received:**
- [ ] Payment verified and confirmed
- [ ] Amount matches product price
- [ ] Transaction screenshot/proof saved
- [ ] Payment logged in tracking sheet

**Account Creation:**
- [ ] Customer details collected
- [ ] Account created via admin panel or script
- [ ] Login credentials generated
- [ ] Account tested (can login)

**Post-Creation:**
- [ ] Credentials sent securely
- [ ] Welcome email/message sent
- [ ] Customer confirmed access
- [ ] Added to renewal reminder calendar
- [ ] Marked complete in tracking sheet

---

## Templates Location

All templates saved in: `/root/.openclaw/workspace/citizen-activation-system/templates/`

- `renewal-invoice-template.pdf`
- `welcome-email-template.txt`
- `payment-confirmation-email.txt`
- `crypto-payment-instructions.md`
- `wire-transfer-instructions.md`

---

## Contact for Manual Payment Questions

**For customers:**
- Email: [your support email]
- Telegram: @mzsamantha
- MOSCA Marketplace: [support channel]

**Processing time:**
- MOSCA Marketplace: 4-24 hours
- Cryptocurrency: 24-48 hours (after confirmations)
- Wire transfer: 3-5 business days

---

## Notes

- This process is temporary until MOSCA Marketplace integration is automated
- Keep detailed records for accounting and tax purposes
- Consider using accounting software (QuickBooks, Xero) for manual payments
- Update tracking sheet weekly
- Review renewal schedule monthly

## Last Updated
2026-05-24 23:30 UTC
