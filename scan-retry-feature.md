# Scan Retry Feature - Testing Guide

## 🎯 **New Retry Functionality Added**

The scan retry feature is now live and allows users to retry failed or pending image scans.

## 📍 **Where to Find It**

### **Main Location: Recent Scans Tab**
1. Go to `http://localhost:3000`
2. Click on the **"Recent Scans"** tab
3. Look for scans with status:
   - 🔴 **Failed** (red X icon)
   - 🟡 **Pending** (yellow clock icon)

### **Retry Buttons Appear In Two Places:**

1. **On Scan Cards:**
   - Small "Retry" button next to "View details"
   - Shows spinning icon during retry
   - Only visible for failed/pending scans

2. **In Scan Details Dialog:**
   - Click any scan to open details
   - "Retry Scan" button at the bottom (if eligible)
   - Larger button with loading state

## 🔄 **How Retry Works**

### **Process:**
1. **Click Retry** → Shows loading state
2. **Re-processes Image** → Uses original uploaded image
3. **Enhanced OCR** → Applies improved text extraction
4. **Database Lookup** → Searches Yu-Gi-Oh! database again
5. **Updates Results** → Refreshes UI with new data

### **What Changes:**
- ✅ **Same Image** → Uses original scan (no re-upload needed)
- ✅ **Better OCR** → May succeed with different preprocessing
- ✅ **Database Search** → Tries exact + fuzzy matching
- ✅ **Updated Card** → Creates new card or updates existing
- ✅ **Status Change** → Updates from failed/pending to identified

## 🎨 **Visual Indicators**

### **Before Retry:**
- 🔴 Failed scans show red X circle
- 🟡 Pending scans show yellow clock
- "Retry" button appears for eligible scans

### **During Retry:**
- 🔄 Button shows spinning refresh icon
- "Retrying..." text appears
- Button is disabled during processing

### **After Successful Retry:**
- ✅ Green checkmark appears
- Status changes to "Identified"
- Card details populate with official data
- Success message shows database match info

## 🧪 **Testing Scenarios**

### **Test Failed Scans:**
1. Upload a blurry/difficult card image
2. Let it fail (or find existing failed scan)
3. Click "Retry" to re-process
4. Watch for improved results

### **Test Pending Scans:**
1. Find any stuck "pending" scans
2. Click "Retry" to force reprocessing
3. Should resolve to "identified" or "failed"

### **Test UI Updates:**
1. Retry a scan and keep details dialog open
2. Watch the status update in real-time
3. See card information populate after success

## 💡 **Benefits**

- **No Re-upload Needed** → Uses original image
- **Improved Success Rate** → Multiple OCR attempts
- **Database Integration** → Enhanced Yu-Gi-Oh! lookup
- **Real-time Updates** → UI refreshes automatically
- **User-Friendly** → Clear retry buttons and loading states

## 🔧 **Technical Details**

- **API Endpoint**: `/api/scan/retry`
- **Security**: Only scan owner can retry
- **Image Handling**: Supports base64 and URL images
- **Database**: Updates existing cards or creates new ones
- **Logging**: Full retry attempt tracking

The retry feature gives users a second chance to successfully identify cards that failed initially, improving the overall scanning experience! 🎉