# PROJECT OVERVIEW

**App Name:** SkillCast  
**One-Sentence Description:** A mobile platform that helps UMIB students connect with local businesses by showcasing their verified skills and personality through video introductions, replacing traditional CVs.

**Problem Statement:** University students (especially at UMIB) struggle to find internships because they lack work experience to fill a traditional CV. Local businesses find it difficult to identify motivated junior talent using only paper applications.

### Target Users
* **Students:** UMIB students searching for internships or first jobs (approx. 2,000+ potential users).
* **Employers:** Local SMEs (Small and Medium Enterprises) in Mitrovica and Prishtina looking for specific skills.

### Why they need this
Students need a way to stand out beyond just grades, and employers need a faster way to screen candidates for "soft skills" and personality.

### The Problem
* **Pain Point:** Students send generic PDF CVs that are often ignored. Employers waste hours interviewing candidates who lack communication skills.
* **Current Solution:** Using LinkedIn (too competitive/global) or physical word-of-mouth.
* **Inadequacy:** LinkedIn favors experienced professionals, making students feel "invisible." Physical methods are inefficient and limited.

---

# SOLUTION & FEATURES

### Core Features (Must-Have)

**1. Video CV / Introduction**
* *Description:* Students record a 30-60 second video introducing themselves and their passion.
* *User Story:* "As a Student, I want to record a short video intro so that employers can see my communication skills and personality immediately."

**2. Verified Skill Badges**
* *Description:* A system where students select skills (e.g., Java, English) which are displayed as "Verified" badges (validated via UMIB email).
* *User Story:* "As an Employer, I want to filter candidates by specific tags like 'Java' or 'Marketing' so I only see relevant profiles."

**3. Smart Job Feed**
* *Description:* A dashboard for students showing internship opportunities that match their selected skills.
* *User Story:* "As a Student, I want to see a list of jobs that match my major and skills so I don't waste time applying to irrelevant positions."

### Secondary Features (Nice-to-Have)
* **Direct Interview Request:** A button for employers to send a meeting invite directly in-app.
* **Career Tips Section:** A static feed with advice on how to pass job interviews.

### Features We Explicitly Won't Include (Out of Scope)
* In-app Payment Processing (Stripe/PayPal).
* Complex Contract Management or Digital Signatures.
* Real-time Chat/Messaging System (we will use external email/phone for contact).

---

# TECHNICAL ARCHITECTURE

**01. User Authentication**
* *Method:* Firebase Authentication (Email/Password).
* *Roles:* Student (requires @umib.net email for verification), Employer (Standard email), Admin.

**02. Database Schema (Firestore)**
* `Users Collection`: id, name, role, bio, videoUrl, profileImage.
* `Skills Collection`: id, userId, skillName, category.
* `Jobs Collection`: id, companyId, title, description, requiredSkills.
* `Applications Collection`: id, jobId, studentId, status.

**03. External API Integration**
* *API:* We might use Expo ImagePicker and Firebase Storage for handling media.
* *Why:* To allow users to upload profile pictures and video files securely.

**04. Key Technologies**
* *Frontend:* React Native with Expo.
* *Backend:* Firebase (Firestore, Auth, Storage).
* *Libraries:* react-navigation (routing), expo-camera (video), react-native-paper (UI components).

---

# USER FLOW & SCREENS

### Main User Journey
1.  User (Student) opens app and signs up with UMIB email.
2.  User builds profile: adds name, faculty, and selects 3-5 skills (tags).
3.  User records a 30-second video introduction using the phone camera.
4.  User navigates to "Jobs" tab and sees a list of local internships.
5.  User clicks on a Job Card to view details.
6.  User clicks "Apply with Profile".
7.  Employer receives notification and views the Student's Video CV.

### Screen Sketches (Descriptions)
* **Login/Signup Screen:** Clean UI with "Student Login" and "Employer Login" toggles.
* **Student Profile Builder:** A form to add bio, select skills from a dropdown, and a large "Record Video" button.
* **Job Feed (Home):** A ScrollView showing job cards (Title, Company Logo, Skills Needed).
* **Candidate View (For Employers):** A screen displaying the Student's photo, the video player in the center, and their skill badges below.
* **My Applications:** A list showing status of applied jobs (Pending, Accepted, Rejected).

---

# DEVELOPMENT TIMELINE

* **Week 9: Planning & Setup**
    * Project proposal approved.
    * Git repository created and shared.
    * Firebase project initialized.
* **Week 10: Authentication & Database**
    * User authentication implemented.
    * Database schema created in Firestore.
* **Week 11: Core Features - Part 1**
    * Basic navigation structure.
    * Profile Builder implemented.
    * Video Recording functionality.
* **Week 12: Core Features - Part 2**
    * Job Feed implemented.
    * Employer Dashboard created.
* **Week 13: Polish & Secondary Features**
    * UI/UX improvements.
    * Error handling.
* **Week 14: Testing & Bug Fixes**
    * Testing on Android/iOS simulators.
    * Bug fixes.
* **Week 15: Final Presentation**
    * Demo video recorded.
    * Live demo practiced.

---

# CHALLENGES & RISKS

**Challenge 1: Handling video uploads and playback speed on mobile data.**
* *Mitigation:* We will limit video length to 30 seconds and compress files before uploading to Firebase Storage.

**Challenge 2: Accurate filtering/matching of skills.**
* *Mitigation:* We will use a predefined list of tags (fixed dataset) instead of allowing users to type free text.

**Backup Plan:** If native video recording proves too complex, we will allow students to paste a YouTube/Drive link instead.

---

# SUCCESS METRICS

* **Functional Success:** Student can create profile/upload video; Employer can view profile; Auth works securely.
* **Quality Success:** Professional UI; Video loads within 2 seconds.
* **Learning Success:** Team understands React Native + Firebase; Proper Git workflow.

---

# WHY THIS PROJECT MATTERS

**Example:** "This project matters because it directly addresses the 'experience gap' facing UMIB students. By building a platform that highlights potential over past experience, we are helping our peers find employment."

* **Personal Motivation:** We want to solve the difficulty we personally face when looking for internships.
* **Real-World Impact:** Local businesses get access to a hidden talent pool, and students get their first career opportunity.