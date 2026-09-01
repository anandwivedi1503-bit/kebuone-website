export const EVUDDY_KNOWLEDGE = `
EVUDDY (by Kebu One / Shubhrax Mobility Ltd) is an electric scooter rental and Rent-to-Own platform in India.
Live site: https://www.evuddy.com

Key pages:
- Book / ride options: /ride-options then /book-bike
- Rent to Own: /rent-to-own
- Register / KYC: /register
- Contact / helpdesk: /contact — email helpdesk@kebuone.in — phone +91 8726006512
- Fleet partner investment: /partners (plans + apply form)
- About, Vision, Leadership, Careers: /about /vision /Leadership /careers
Office: Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010.

RIDER BOOKING (normal rental):
1. Register with phone OTP (Firebase). Complete KYC (Aadhaar; licence optional). Wait for staff approval.
2. Choose city, hub, scooter, and plan: Hourly, Daily, Weekly, Monthly.
3. Reserve scooter (locks that rider + that vehicle).
4. Pay rent + 5% GST (CGST 2.5% + SGST 2.5%) + refundable security deposit (typically ₹2500 on rentals).
5. Pay with Razorpay (UPI/card) or EVUDDY wallet if balance is enough.
6. First payment (≥ ₹1, even partial) issues Pickup OTP. Tell it to the yard to unlock. After yard saves it, swipe Ride started on Book EV.
7. Remaining rent must be ₹0 before Ride end. Return to yard, swipe Ride end, tell Ride-end OTP to yard. Deposit refund is staff-approved after return (usually to EVUDDY wallet, or Razorpay — never both).

Catalog rates (a vehicle may override): Hourly ₹60, Daily ₹230, Weekly ₹1,610, Monthly ₹6,900 (+ 5% GST).

RENT TO OWN:
₹280 + 5% GST every day for 18 months. NO security deposit. Daily receipt. Keep the scooter. Ownership after successful term. Do not treat it like a monthly return rental.

WALLET:
Rider EVUDDY purse for returned deposits / credits. Not an extra charge on top of Razorpay. Deposits are part of the booking bill.

SUPPORT TICKETS:
- Contact page form creates a website enquiry ticket.
- On a paid booking, Book EV → Need help? opens a ticket bound to that booking (pickup, mid-ride, battery, breakdown).
- Rider can see status/replies on Book EV. Staff see tickets on Support dashboard.

FLEET PARTNER INVESTMENT (published model on /partners):
- You invest; EVUDDY operates the fleet; 50/50 profit share.
- Example model: 3 scooters per ₹1 lakh, rented ~₹230 / 24 hrs; about ₹87 profit per scooter after ops; investor share ~₹43.5 / scooter / day → ~₹3,915 / month on ₹1 lakh plan; scrap value example ₹6,000 / scooter; 42-month horizon; ₹1 lakh plan total example ~₹1,82,430.
- Plans shown: ₹1L / ₹5L / ₹10L with proportional monthly and scrap figures.
- Apply on partners form. No investment payment is taken inside Eva chat.

LEADERSHIP (public posters on /Leadership):
Chairman Anjali Mishra; Founder & CEO Sunil Pathak; General Manager Bindu Singh; team includes SDE Anand Dhar Dwivedi, Admin & Front Desk Aanya Singh, Graphic Designer Akanksha Maurya.

Never invent hubs, secret prices, or fake approvals. If unsure, send rider to /book-bike, /partners, /contact, helpdesk@kebuone.in or +91 8726006512.
Eva cannot take payments, enter OTP, unlock scooters, approve KYC/refunds, or change bookings from chat.
`.trim();

export const ASSISTANT_STARTERS = [
  "How do I book a scooter?",
  "What are the rental rates?",
  "What is Rent to Own?",
  "Tell me about fleet investment plans",
  "How do support tickets work?",
  "स्कूटर कैसे बुक करें?",
];
