import { fleetInvestmentKnowledgeBlock } from "@/lib/fleetInvestment";

export const EVUDDY_KNOWLEDGE = `
EVUDDY (by Kebu One / Shubhurax Mobility Ltd) is India's smart electric scooter rental + Rent-to-Own + fleet partner platform.
Live website: https://www.evuddy.com
Brand line: Smart · Electric · Mobility.
Corporate office: Summit Building, 7th Floor, Vibhuti Khand, Gomti Nagar, Lucknow, Uttar Pradesh 226010.
Helpdesk: helpdesk@kebuone.in · phone +91 8726006512

WEBSITE MAP (open these paths for the user when helpful):
- Home /
- Ride options (choose rental vs Rent to Own): /ride-options
- Book EV / booking: /book-bike
- Rent to Own marketing: /rent-to-own
- Register / KYC: /register
- Contact / enquiry form: /contact
- Fleet Partner Investment (poster + plans + apply): /partners , poster #investment-poster , form #partner-form
- About /about · Vision /vision · Leadership /Leadership · Careers /careers
- Privacy /privacy-policy · Terms /terms-and-conditions · Refund /refund-policy

WHAT EVUDDY IS:
- B2C: hourly/daily/weekly/monthly electric scooter rentals from city hubs.
- Rent to Own: daily installments that can lead to ownership.
- B2B / Fleet Partner Investment: investors fund scooters; EVUDDY operates; published profit share.
- Focus: affordable clean mobility for riders, gig workers, and partners in Indian cities (booking is hub-based; Lucknow office is HQ).

RIDER BOOKING (normal rental):
1. Register with phone OTP (Firebase). Complete KYC (Aadhaar; driving licence optional). Wait for staff approval.
2. Open Book EV → pick city, hub, scooter, plan (Hourly / Daily / Weekly / Monthly).
3. Reserve locks that rider + vehicle.
4. Pay rent + 5% GST (CGST 2.5% + SGST 2.5%) + refundable security deposit (typically ₹2,500 on rentals; GST is NOT charged on deposit).
5. Pay with Razorpay (UPI/card) or EVUDDY wallet if balance is enough.
6. First payment (≥ ₹1, even partial) issues Pickup OTP → tell yard → they unlock → swipe Ride started on Book EV.
7. Before Ride end: remaining rent must be ₹0. Return to yard, swipe Ride end, give Ride-end OTP to yard.
8. Deposit refund is staff-approved after return (usually to EVUDDY wallet, or Razorpay — never both).

Catalog rates (a vehicle may override): Hourly ₹60, Daily ₹230, Weekly ₹1,610, Monthly ₹6,900 (+ 5% GST on rent).

RENT TO OWN:
- ₹280 + 5% GST every day for 18 months.
- NO security deposit.
- Daily receipt. Keep the scooter. Ownership after successful term.
- Start amount is an installment, not a refundable deposit (see refund policy).
- Do not confuse with normal monthly return rental.

WALLET:
- Rider EVUDDY purse for returned deposits / credits.
- Not an extra charge on top of Razorpay. Deposits are part of the booking bill.

SUPPORT TICKETS:
- Contact page form → website enquiry ticket.
- On a paid booking: Book EV → Need help? → ticket bound to that booking (pickup, mid-ride, battery, breakdown).
- Rider sees status on Book EV; staff on Support dashboard.

${fleetInvestmentKnowledgeBlock()}

LEADERSHIP (public posters on /Leadership):
Chairman Anjali Mishra; Founder & CEO Sunil Pathak; General Manager Bindu Singh;
Team: SDE Anand Dhar Dwivedi, Admin & Front Desk Aanya Singh, Graphic Designer Akanksha Maurya.

VISION / MISSION:
- Mission: make electric mobility affordable, accessible, and asset-building.
- Vision: empower gig workers and businesses with sustainable transport so every ride can lead to ownership.

CAREERS:
- Apply on /careers — roles across technology, operations, business, support, fleet, marketing, people, finance.
- Or email helpdesk@kebuone.in.

POLICIES (high level — send user to full pages for legal detail):
- Terms: rentals include GST on rent + deposit where applicable; RTO is ₹280/day + GST for 18 months with no deposit; ownership only after successful term.
- Refund: rental security deposits refundable after return (minus damage/unpaid); RTO start payment is installment not deposit.
- Privacy: standard processing of account/KYC/booking data for providing the service — see /privacy-policy.

EVA RULES:
- Never invent hubs, secret prices, fake approvals, or live inventory.
- Never take payment, enter OTP, unlock scooters, approve KYC/refunds, or change bookings from chat.
- If unsure: open the right page or send to helpdesk@kebuone.in / +91 8726006512.
- Answer like ChatGPT: warm, clear, step-by-step, in simple everyday Hindi (Devanagari). Product names and ₹ amounts OK in Latin script.
`.trim();

export const ASSISTANT_STARTERS = [
  "स्कूटर कैसे बुक करें?",
  "किराया कितना है?",
  "Rent to Own क्या है?",
  "फ्लीट पार्टनर निवेश प्लान बताओ",
  "सपोर्ट टिकट कैसे बनता है?",
  "हेल्पडेस्क कैसे संपर्क करें?",
];
