# 🧪 Complete End-to-End Testing Guide

This guide walks you through the complete agricultural disease detection platform workflow, testing all features and user roles.

---

## 📋 Pre-Testing Checklist

Before starting tests, ensure:

- [ ] Backend dependencies installed: `pip install -r backend/requirements.txt`
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] Database initialized: `python -m app.database.init_db`
- [ ] Backend server running: `python -m uvicorn app.main:app --reload` (port 8000)
- [ ] Frontend dev server running: `npm run dev` (port 5173)

---

## 🔐 Demo User Credentials

```
System Admin:
  Email: admin@agri.com
  Password: AdminPass123!

Cooperative Admin:
  Email: coop_admin@kigali.com
  Password: CoopAdminPass123!

Farmer:
  Email: farmer@kigali.com
  Password: FarmerPass123!

Agronomist:
  Email: agronomist@kigali.com
  Password: AgronomistPass123!

Registration Codes (for new users):
  Farmer: SAMPLE-FARMER-001 through 005
  Agronomist: SAMPLE-AGRONOMIST-001, 002
```

---

## ✅ Test 1: User Registration Flow

### Objective
Test that new users can register using registration codes.

### Steps

1. **Open Application**
   - Navigate to `http://localhost:5173`
   - Click "Register" button

2. **Register as New Farmer**
   - Click "Register as Farmer" tab
   - Enter registration code: `SAMPLE-FARMER-001`
   - Observe: Province (Kigali) and District (Gasabo) auto-fill
   - Enter email: `newfarmer@test.com`
   - Enter password: `TestPass123!` (8+ chars, uppercase, lowercase, number, special char)
   - Enter full name: `New Test Farmer`
   - Click "Register"

3. **Expected Result**
   - ✅ Code should auto-fill location
   - ✅ Registration successful message
   - ✅ Redirected to login page
   - ✅ Code marked as used (verify in DB: registration_codes.is_active = False)

---

## ✅ Test 2: Login & Navigation

### Objective
Test authentication and role-based navigation.

### Steps

1. **Login as Farmer**
   - Email: `farmer@kigali.com`
   - Password: `FarmerPass123!`
   - Expected: Farmer Dashboard loads
   - Check navigation shows "Farmer Dashboard" link

2. **Login as Agronomist**
   - Logout (click logout button)
   - Email: `agronomist@kigali.com`
   - Password: `AgronomistPass123!`
   - Expected: Agronomist Dashboard loads
   - Check navigation shows "Agronomist Dashboard" link

3. **Login as Cooperative Admin**
   - Logout
   - Email: `coop_admin@kigali.com`
   - Password: `CoopAdminPass123!`
   - Expected: Admin Dashboard loads
   - Check navigation shows "Admin Dashboard" link

4. **Permission Test**
   - Farmer tries to access `/dashboard/agronomist` in URL
   - Expected: Redirected to farmer dashboard (ProtectedRoute blocks)
   - Agronomist tries to access `/dashboard/admin`
   - Expected: Redirected to agronomist dashboard

---

## ✅ Test 3: Farmer Image Upload & Prediction

### Objective
Test ML inference - farmer uploads crop image, model predicts disease.

### Steps

1. **Login as Farmer**
   - Email: `farmer@kigali.com`
   - Password: `FarmerPass123!`

2. **Upload Test Image**
   - Click "FarmerDashboard"
   - Click "Upload Image" button
   - Select a plant leaf image (test images in `models/test_images/` if available)
   - Image preview should show
   - Click "Predict Disease"

3. **Expected Result**
   - ✅ Loading indicator shows while model processes
   - ✅ Prediction shows disease name + confidence (0-100%)
   - ✅ Example: "Early Blight (87.5%)"
   - ✅ Farmer recommendations displayed below
   - ✅ Image saved to database (images table)
   - ✅ Prediction saved to database (predictions table with predicted_disease, confidence, model_version)
   - ✅ Prediction marked as pending validation (no validation records yet)

4. **Check Database**
   ```sql
   -- Verify image was created
   SELECT * FROM images ORDER BY created_at DESC LIMIT 1;
   
   -- Verify prediction was created
   SELECT * FROM predictions ORDER BY created_at DESC LIMIT 1;
   ```

---

## ✅ Test 4: Agronomist Validation

### Objective
Test agronomist reviewing predictions and providing validation feedback.

### Steps

1. **Login as Agronomist**
   - Email: `agronomist@kigali.com`
   - Password: `AgronomistPass123!`

2. **View Pending Predictions**
   - Click "Agronomist Dashboard"
   - Left panel shows "Pending Predictions" list
   - Should see prediction from farmer uploaded in Test 3
   - Prediction shows: Farmer name, disease, confidence, location

3. **Validate Prediction**
   - Click on prediction in left panel
   - Right panel shows validation form
   - Option 1: "Correct ✓" (model was right)
     - Select this if prediction matches your observation
   - Option 2: "Incorrect ✗" (model was wrong, I know the real disease)
     - Select this + enter correct disease name in dropdown
   - Option 3: "Unsure ?" (need more information)
     - Select this
   - Enter feedback/recommendations textarea:
     - Example: "Use copper fungicide, spray at dusk to avoid leaf burn"
   - Click "Submit Validation"

4. **Expected Result**
   - ✅ Validation saved to database (validations table)
   - ✅ Validation linked to prediction (prediction_id, agronomist_id)
   - ✅ Feedback stored
   - ✅ Prediction removed from "Pending" list (LEFT JOIN shows no pending validations now)
   - ✅ Validation appears in right panel showing agronomist's response

5. **Check Database**
   ```sql
   -- Verify validation was created
   SELECT * FROM validations ORDER BY created_at DESC LIMIT 1;
   
   -- Check if prediction still shows as pending
   SELECT * FROM predictions WHERE id = ? 
   LEFT JOIN validations ON predictions.id = validations.prediction_id
   WHERE validations.id IS NULL;  -- Should return 0 rows now
   ```

---

## ✅ Test 5: Farmer Sees Validation Feedback

### Objective
Test farmer viewing validation feedback from agronomist.

### Steps

1. **Login as Farmer**
   - Email: `farmer@kigali.com`
   - Password: `FarmerPass123!`

2. **View Validation History**
   - Click "View My Predictions" section
   - Find the prediction from Test 3
   - Click to expand
   - Should show:
     - Original prediction: "Early Blight (87.5%)"
     - Agronomist validation: "Correct ✓" or "Incorrect - Powdery Mildew"
     - Treatment recommendation: "Use copper fungicide..."
     - Agronomist name and date

3. **Expected Result**
   - ✅ Feedback visible to farmer
   - ✅ Farmer can see agronomist's diagnosis
   - ✅ Farmer can see treatment recommendations

---

## ✅ Test 6: Cooperative Admin - Generate Registration Codes

### Objective
Test admin generating registration codes for new users to register.

### Steps

1. **Login as Cooperative Admin**
   - Email: `coop_admin@kigali.com`
   - Password: `CoopAdminPass123!`

2. **Generate Codes**
   - Click "Admin Dashboard"
   - Click "Registration Codes" tab
   - Form fields visible:
     - Role: Select "Farmer"
     - Province: Select "Kigali"
     - District: Select "Gasabo"
     - Quantity: Enter "10"
   - Click "Generate Codes"

3. **Expected Result**
   - ✅ 10 codes generated and displayed
   - ✅ Codes format: Random alphanumeric (8 chars), e.g., "aB3xK9pL"
   - ✅ "Copy to Clipboard" button works
   - ✅ Codes saved to database (registration_codes table)
   - ✅ Each code marked is_active=True
   - ✅ Codes linked to role + location

4. **Verify Code Works**
   - Copy one generated code
   - Logout
   - Click "Register"
   - Paste code in registration form
   - Verify: Province (Kigali) and District (Gasabo) auto-fill
   - Register with new email
   - Complete registration

5. **Check Database**
   ```sql
   -- Verify codes were created
   SELECT * FROM registration_codes 
   WHERE code LIKE '%xK9%' LIMIT 1;  -- Check one of generated codes
   
   -- After registration, code should be inactive
   SELECT * FROM registration_codes WHERE code = 'aB3xK9pL';
   -- is_active should be FALSE
   -- used_by_id should be the new farmer's user ID
   ```

---

## ✅ Test 7: Cooperative Admin - Assign Agronomists

### Objective
Test admin assigning agronomists to geographic regions.

### Steps

1. **Login as Cooperative Admin**
   - Email: `coop_admin@kigali.com`
   - Password: `CoopAdminPass123!`

2. **Make New Assignment**
   - Click "Admin Dashboard"
   - Click "Assignments" tab
   - Form fields:
     - Agronomist: Select "Demo Agronomist" (or other available)
     - Level: Select "District"
     - Location ID: Enter "1" (Gasabo District ID)
   - Click "Create Assignment"

3. **Expected Result**
   - ✅ Assignment created and added to list
   - ✅ Assignment shows: "Demo Agronomist → Gasabo District"
   - ✅ Assignment saved to database (assignments table)
   - ✅ Agronomist now sees predictions from Gasabo farmers

4. **Test Assignment Effect**
   - Agronomist logs in → Dashboard
   - Should now see predictions from:
     - Any farmer in Gasabo District
     - Or refined to sector/cell/village if assignment was more specific

5. **Check Database**
   ```sql
   -- Verify assignment was created
   SELECT * FROM assignments 
   WHERE agronomist_id = 3 AND district_id = 1;
   
   -- Should return 1 row with is_active = TRUE
   ```

---

## ✅ Test 8: Admin Statistics View

### Objective
Test admin seeing organization statistics.

### Steps

1. **Login as Cooperative Admin**
   - Email: `coop_admin@kigali.com`
   - Password: `CoopAdminPass123!`

2. **View Statistics**
   - Click "Admin Dashboard"
   - Top of page shows 4 stat cards:
     - 👨‍🌾 Farmers: Should show count
     - 👨‍🔬 Agronomists: Should show count
     - ⏳ Pending Predictions: Should show unvalidated predictions
     - ✅ Validations: Should show completed validations

3. **View Top Diseases**
   - Click "Statistics" tab
   - Should show bar chart of most common diseases
   - Example: "Early Blight: 5 occurrences, Powdery Mildew: 3 occurrences"

4. **Expected Result**
   - ✅ Stats update as predictions/validations are made
   - ✅ Counts accurate
   - ✅ Data pulled from database aggregations

---

## ✅ Test 9: Token Expiration & Re-authentication

### Objective
Test JWT token handling and forced re-login.

### Steps

1. **Login as Farmer**
   - Email: `farmer@kigali.com`
   - Password: `FarmerPass123!`

2. **Verify Token Stored**
   - Open DevTools (F12)
   - Go to Application tab
   - Check localStorage for key: `auth_token`
   - Should contain JWT token (long string with 3 parts separated by dots)

3. **Simulate Token Expiration**
   - Open DevTools Console
   - Type: `localStorage.clear()`
   - Refresh page

4. **Expected Result**
   - ✅ Redirected to login page (ProtectedRoute detects no token)
   - ✅ Can login again
   - ✅ New token stored

---

## ✅ Test 10: Error Handling

### Objective
Test application handles errors gracefully.

### Steps

### 10A: Invalid Password
1. Go to login
2. Enter email: `farmer@kigali.com`
3. Enter password: `WrongPassword123!`
4. Click Login
5. Expected: Error message "Invalid email or password"

### 10B: Non-Existent User
1. Go to register
2. Enter code: `INVALID-CODE-123`
3. Expected: Error "Code not found or inactive"

### 10C: Permission Denied
1. Login as Farmer
2. In URL bar, change path to `/dashboard/agronomist`
3. Expected: Redirected to farmer dashboard (role mismatch)

### 10D: Network Error
1. Stop backend server
2. Try to upload image as farmer
3. Expected: Error message "Connection failed" or similar
4. Restart backend

---

## 🐛 Debugging Tips

### Check Backend Logs
```bash
# Terminal where backend is running
# Look for error traces in console
# Example error: 
#   File "/app/api/v1/predictions.py", line 45, in create_prediction
#   SQLAlchemy error: foreign key constraint failed
```

### Check Frontend Logs
```javascript
// DevTools Console (F12)
// Look for errors and API responses
console.log(response); // Log API response
```

### Database Inspection
```bash
# Open SQLite database
sqlite3 backend/app/database/database.db

# Check tables
.tables

# Example queries
SELECT * FROM users;
SELECT * FROM predictions WHERE farmer_id = 2;
SELECT * FROM validations WHERE agronomist_id = 3;
SELECT * FROM assignments;
```

### API Testing with curl
```bash
# Test login endpoint
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"farmer@kigali.com","password":"FarmerPass123!"}'

# Response should include: {"access_token": "eyJ0eXAi...", "token_type": "bearer"}

# Test predictions endpoint with token
curl -X GET http://localhost:8000/api/v1/predictions/user/me \
  -H "Authorization: Bearer <token_here>"
```

---

## 📊 Test Results Checklist

After running all tests, mark completion:

- [ ] Test 1: User Registration - PASSED
- [ ] Test 2: Login & Navigation - PASSED
- [ ] Test 3: Image Upload & Prediction - PASSED
- [ ] Test 4: Agronomist Validation - PASSED
- [ ] Test 5: Farmer Sees Feedback - PASSED
- [ ] Test 6: Admin Generate Codes - PASSED
- [ ] Test 7: Admin Assign Agronomists - PASSED
- [ ] Test 8: Admin Statistics - PASSED
- [ ] Test 9: Token Expiration - PASSED
- [ ] Test 10: Error Handling - PASSED

---

## 🎯 Full Workflow Test (Integration Test)

Test the complete workflow end-to-end:

```
1. Cooperative Admin generates registration codes
2. Farmer registers using code
3. Farmer logs in and uploads crop image
4. ML model predicts disease
5. Agronomist logs in and sees pending prediction
6. Agronomist validates prediction + provides feedback
7. Farmer logs in and sees validation feedback
8. Cooperative Admin views organization statistics
```

**Expected Result: All 8 steps complete without errors ✅**

---

## 📝 Performance Tests (Optional)

### Load Test: Multiple Predictions
1. Upload 10 images in rapid succession
2. Expected: All process correctly, database handles concurrency
3. Check for race conditions or duplicate IDs

### API Response Time
1. Time prediction endpoint: Should be < 2 seconds
2. Time validation endpoint: Should be < 500ms
3. Time admin statistics endpoint: Should be < 1 second

---

## 🚀 Next Steps

After testing is complete:

1. **Deployment**
   - Deploy backend to production server
   - Deploy frontend to CDN
   - Configure environment variables

2. **Monitoring**
   - Set up error tracking (Sentry)
   - Set up analytics
   - Monitor model performance

3. **Scaling**
   - Optimize database queries
   - Add caching layer (Redis)
   - Consider distributed inference

---

## 📞 Support

If tests fail:

1. Check backend console for Python errors
2. Check frontend console for JavaScript errors
3. Check database for missing data
4. Verify all API endpoints are registered in router.py
5. Check CORS configuration if API requests fail

---

**Happy Testing! 🎉**
