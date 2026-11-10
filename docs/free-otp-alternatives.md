# Free & Low-Cost Mobile OTP Alternatives to Twilio

> **WearID** — *Authentication Architecture Specification*  
> Practical alternatives to Twilio for SMS and message OTP verification with zero monthly subscription fees, high Indian carrier deliverability, and free tier quotas.

---

## 1. Why Twilio Is Problematic for Startups & Indian Numbers

| Twilio Bottleneck | Impact on Developers / Startups |
| :--- | :--- |
| **High Per-SMS Cost** | Twilio charges **\$0.05 to \$0.07 per SMS (₹4.50 to ₹6.00 INR)** for Indian phone numbers, compared to ₹0.15 on domestic routes. |
| **TRAI / DLT Registration Gate** | In India, the Telecom Regulatory Authority of India (TRAI) requires **DLT Principal Entity registration**, Header/Sender ID approval, and registered Content Templates. Twilio accounts without approved Indian DLT registrations frequently have SMS messages blocked or delayed. |
| **No Permanent Free Quota** | Twilio offers only a one-time trial credit (\$15) and charges monthly fees (\$1.15/month) just to keep a phone number reserved. |
| **Trial Number Sandboxing** | Trial accounts cannot send SMS to arbitrary customer numbers without manually verifying each destination number in advance. |

---

## 2. Top Recommended Free & Low-Cost Alternatives

### 🏆 Option 1: Google Firebase Phone Authentication (Best Free SMS)
* **Free Quota:** **10,000 free phone SMS OTP verifications per month** forever on the Firebase Spark (free) plan.
* **Why it's the #1 Choice:**
  - Google negotiates direct tier-1 telco routes with Indian telecom providers (Airtel, Jio, Vi, BSNL).
  - Handles anti-abuse via invisible reCAPTCHA automatically.
  - Zero cost for the first 10k authentications every single month.
  - No TRAI DLT registration required from the developer.
* **How to Set Up:**
  1. Open [Firebase Console](https://console.firebase.google.com/) and create a project (e.g., `wearid-auth`).
  2. Under **Build > Authentication**, enable **Phone** provider.
  3. Under **Project Settings > General**, copy your Web App configuration (`apiKey`, `authDomain`, `projectId`).
  4. In client code or login modal, use `signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)` to trigger Google's free SMS pipeline.

---

### 💬 Option 2: Meta WhatsApp Business Cloud API (Best Delivery in India)
* **Free Quota:** **1,000 free service/authentication conversations per month** from Meta.
* **Why it's Ideal for India:**
  - Over 500 million active WhatsApp users in India.
  - 99.5% instant delivery within 2 seconds (avoids carrier SMS dead zones and spam filters).
  - Completely avoids SMS carrier termination fees and telecom regulations.
* **How to Set Up:**
  1. Go to [Meta for Developers](https://developers.facebook.com/) and create a **Business** app.
  2. Add **WhatsApp Product** to obtain a temporary Access Token and `Phone Number ID`.
  3. Create an Authentication Message Template (e.g., `wearid_auth_otp`: *"Your WearID verification code is {{1}}"*).
  4. Add the following to your `.env.local`:
     ```ini
     WHATSAPP_CLOUD_API_TOKEN=your_meta_system_user_access_token
     WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
     WEARID_OTP_PROVIDER=whatsapp
     ```
  5. The WearID `/api/auth/otp/send` route automatically formats and delivers the OTP code directly to the customer's WhatsApp chat.

---

### ✉️ Option 3: Supabase Native Email 6-Digit OTP / Magic Link (100% Free Forever)
* **Free Quota:** **50,000 monthly active users (MAU) FREE** on Supabase.
* **Why it's Great:**
  - **Already fully implemented and functional in WearID!**
  - Instant zero-friction login via 6-digit email OTP or 1-click magic link.
  - Zero credit card, zero external setup, zero spam filter blocking.
  - Accessible immediately in `src/app/login/page.tsx` under the **Email OTP** tab.

---

### 🇮🇳 Option 4: Domestic Indian SMS Gateways (2Factor.in / Fast2SMS)
*If you need direct carrier SMS in India beyond 10k/month without Twilio's high prices:*

| Feature | 2Factor.in | Twilio |
| :--- | :--- | :--- |
| **Cost Per SMS** | **₹0.15 – ₹0.18** | **₹4.50 – ₹6.00** (~28x more expensive) |
| **DLT Assistance** | Pre-approved transactional templates | Manual complex enterprise setup |
| **Indian Delivery Rate** | 99.8% via direct Airtel/Jio gateways | Variable without Indian DLT |
| **Free Starter Trial** | Free signup test credits | $15 credit but requires test phone whitelisting |

* **Quick Integration via WearID Adapter:**
  Add to `.env.local`:
  ```ini
  TWOFACTOR_API_KEY=your_2factor_api_key
  WEARID_OTP_PROVIDER=twofactor
  ```
  The WearID internal OTP router (`src/lib/auth/otpProviders.ts`) directly dispatches to the 2Factor transactional gateway.

---

## 3. WearID Unified OTP API Specification

WearID provides built-in API endpoints that decouple your application from any specific vendor:

### Send OTP
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "target": "+919876543210",
  "provider": "mock" | "whatsapp" | "twofactor" | "firebase",
  "channel": "sms" | "whatsapp"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "messageId": "msg_01h...",
  "provider": "whatsapp",
  "channel": "whatsapp",
  "expiresInSeconds": 300,
  "message": "Verification code sent to your WhatsApp number."
}
```

### Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "target": "+919876543210",
  "code": "849201"
}
```

**Response (200 OK):**
```json
{
  "valid": true,
  "message": "Code verified successfully.",
  "verifiedAt": "2026-11-10T10:15:00.000Z"
}
```

### Security & Invariants
1. **Timing-Safe Verification:** Uses `crypto.timingSafeEqual` with salted HMAC-SHA256 to prevent timing side-channel attacks.
2. **Brute-Force Lockout:** OTPs are strictly invalidated after 5 consecutive incorrect attempts.
3. **Strict 5-Minute TTL:** Unverified tokens automatically expire and are purged from memory.
4. **Rate Limiting:** Enforces a 60-second cooldown period between resend requests per phone number.
