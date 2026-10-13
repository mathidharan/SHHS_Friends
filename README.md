# School Friends Profile

A modern, responsive web application for managing and displaying school alumni profiles using an executive **30:70 horizontal business card** design.

Built using clean **HTML5, Vanilla CSS3, and JavaScript**.

---

## 📁 Project Structure

```
School Friends Profile/
├── index.html            # Page 1: Member Registration Form with Live Card Preview
├── profiles.html         # Page 2: Directory Showcase with 30:70 Card View
├── data.json             # JSON file storing registered member records
├── README.md             # Documentation & Guide
├── css/
│   └── style.css         # Modern Executive Design System (Dark/Light themes)
└── js/
    ├── app.js            # Core data manager, theme switcher, storage sync
    ├── form.js           # Form validation & real-time business card live preview
    └── profiles.js       # Directory rendering, search, filters & admin photo manager
```

---

## 🌟 Key Features

### 1. Page 1: Registration Form (`index.html`)
- Captures all requested profile fields:
  - **Full Name**
  - **Gender** (Male, Female, Other)
  - **Date of Birth (DOB)**
  - **Current Job** (Company / Organization)
  - **Job Designation** (e.g. Senior Architect, Director, Specialist)
  - **Current Living City** (e.g. Bangalore, Chennai, Mumbai)
  - **Working Sector** (Self, Private, Govt) with distinctive sector tags
  - **Profile Image** (Device file upload, web image URL, or preset avatars)
  - Optional contact fields (Phone, Email)
- **Live Interactive Business Card Preview**: A sticky real-time preview on the side formats and renders the 30:70 business card instantly as the user types.

### 2. Page 2: Directory Card View (`profiles.html`)
- Displays registered alumni in a responsive **30:70 Horizontal Business Card** format:
  - **30% Left Section**:
    - Member portrait photo with subtle framing and shadow.
    - Working sector pill badge (**Private**, **Govt**, **Self-Employed**).
    - **Admin Photo Manager**: Camera button & "Edit Photo" trigger allowing admins to change/add photos for any registered friend.
  - **70% Right Section**:
    - Full Name & Gender tag.
    - Job Designation & Current Company.
    - Metadata details: Date of Birth & calculated age (e.g., `15 Jun 1994 (32 yrs)`), Current Living City, Working Sector, and Contact.
    - Business card footer with ID and action buttons (Photo edit, delete).
- **Search & Filter Controls**:
  - Real-time search across names, designations, companies, cities, and sectors.
  - Sector filter pills: **All**, **Private**, **Govt**, **Self**.

### 3. Data Storage & JSON Management
- Initial seed profiles are preloaded from `data.json`.
- Uses resilient fallback to `localStorage` so the application runs immediately without requiring a backend server or even when opened via the `file://` protocol.
- **Export JSON**: Download the updated `data.json` directly from the UI with a single click.
- **Import JSON**: Load an existing `data.json` file into the directory.

### 4. Aesthetics & Polish
- Modern typography via Google Fonts (`Outfit` & `Plus Jakarta Sans`).
- Dark and Light mode theme toggle with persistent preferences.
- Glassmorphism, smooth micro-interactions, and toast alerts.

---

## 🚀 How to Open and Run

You can view the project in two ways:

### Option A: Open directly in any Web Browser
Double-click `index.html` or `profiles.html` inside the `School Friends Profile` directory.

### Option B: Local Web Server
You can also launch a lightweight local HTTP server:
```bash
# Using Python
python -m http.server 8080

# Or using npx serve
npx -y serve "d:/Antigravity/School Friends Profile"
```
Then visit `http://localhost:8080` in your web browser.
