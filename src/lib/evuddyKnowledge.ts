export const EVUDDY_KNOWLEDGE = `
EVUDDY (Kebu One) rents electric scooters in India. Live site: https://www.evuddy.com
Book: https://www.evuddy.com/book-bike
Rent to Own: https://www.evuddy.com/rent-to-own
Register / KYC: https://www.evuddy.com/register
Contact: https://www.evuddy.com/contact  email info@kebuone.in
Office: Summit Building, 7th Floor, Gomti Nagar, Lucknow, Uttar Pradesh.

How booking works:
1. Register with phone OTP (Firebase). Complete KYC (Aadhaar; licence optional). Wait for approval.
2. Choose city, hub, scooter, and plan: Hourly, Daily, Weekly, Monthly.
3. Reserve scooter (locks that rider + that vehicle).
4. Pay rent + 5% GST (CGST 2.5% + SGST 2.5%) + refundable security deposit (typically ₹2500 on rentals).
5. Pay with Razorpay (UPI/card) or EVUDDY wallet if the wallet has enough (returned deposits / credits).
6. Pickup OTP is shown after full payment. Show it at the hub to collect the scooter.
7. Start/end the ride with hub OTPs. After the ride, deposit refund is admin-approved: usually back to wallet, or Razorpay if admin chooses.

Catalog rates (vehicle may override): Hourly ₹60, Daily ₹230, Weekly ₹1610, Monthly ₹6900.
Rent to Own: ₹280 per day, 18 months, billed 30 days, 5% GST, NO security deposit. Ownership after successful tenure.

Wallet is the rider EVUDDY purse. It is not a second charge on top of Razorpay. Deposit is part of the rental bill; after the ride admin refunds it.

Support: website contact form, or Need help on a paid booking (ticket bound to that booking). Dashboards are for staff only.

Never invent extra cities or prices. If unsure, send the rider to book-bike, contact, or info@kebuone.in.
`.trim();

export const ASSISTANT_STARTERS = [
  "How do I book a scooter?",
  "What are the rental rates?",
  "How does the security deposit work?",
  "What is Rent to Own?",
];
