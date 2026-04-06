# Association Savings Web App

## 📌 Overview
This is a web-based association savings system where:
- 10 members contribute 100 TK daily
- Every 10 days, a random draw selects one winner
- The winner receives the full pooled amount
- A member can only win once per cycle

---

## ⚙️ Tech Stack

### Frontend
- TypeScript
- Next.js (App Router)
- Tailwind CSS
- Axios / Fetch API

### Backend
- TypeScript
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication

---

## 👥 Roles

### Admin
- Manage members
- Add/edit contributions
- Run draw
- Deactivate inactive members

### Member
- View contributions
- View other members' status
- View draw results
- Receive notifications

---

## 🧠 Core Features

### 1. Authentication
- JWT-based login/register
- Role-based access (admin/member)

---

### 2. Member Management
- Admin can:
  - Add/remove members
  - Activate/deactivate users
- Each member has:
  - `hasWon`
  - `isActive`
  - `coverageUntil`

---

### 3. Contribution System

Supports:
- Daily payments
- Bulk payments (multiple days)

#### Key Logic:
- Each payment extends `coverageUntil`
- If expired, coverage resets from current date

---

### 4. Eligibility System

A member is eligible if:
- `hasWon === false`
- `isActive === true`
- `coverageUntil >= today`

---

### 5. Draw System

- Triggered manually by admin
- Random winner selection
- Winner:
  - Receives total pool
  - Marked as `hasWon = true`

---

### 6. Deactivation System

- If `coverageUntil` is older than 25 days:
  - Mark as "at risk"
  - Admin can deactivate user

---

### 7. Notification System (In-App Only)

- Stored in database
- Triggered on:
  - Contribution added
  - Draw completed
  - User wins

---

## 🗂️ Database Models

### User
- name
- email
- password
- role
- hasWon
- isActive
- coverageUntil
- totalPaid

---

### Contribution
- userId
- amount
- daysCovered
- startDate
- endDate

---

### Draw
- drawDate
- winnerId
- totalAmount
- participants

---

### Notification
- userId
- message
- read
- createdAt

---

## 🔄 System Flow

### Contribution
- Admin adds payment
- System updates `coverageUntil`
- Notification created

### Draw
- Admin runs draw
- Random eligible user selected
- Wallet updated
- Notification sent

---

## 🚀 Setup Instructions

### Backend
```bash
cd backend
npm install
npm run dev