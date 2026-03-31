# Maguro to Shari v2 — Framework Plan

## 1. Recommended lightweight build approach

### Recommended stack
- Plain **HTML + CSS + vanilla JavaScript**
- No heavy framework
- No build step required for the first working version
- Easy to upload to Hostinger later as static files
- Easy to convert later into PHP snippets, Hostinger builder blocks, or a lightweight app if needed

### Why this is the right first step
- Fast to build
- Low maintenance
- Portable
- Easy to understand and edit
- Keeps focus on layout and booking logic instead of tooling

### Suggested structure
- `index.html`
- `menu.html`
- `reserve.html`
- `thank-you.html`
- `assets/css/styles.css`
- `assets/js/site.js`
- `assets/js/reserve.js`
- `data/site-content.js`

### Configuration to keep editable
Put these in `data/site-content.js` so Raymond can change them later without touching page structure:
- premium bowl items
- toppings
- drinks
- slot list
- slot capacity
- booking lead days
- closed days
- text labels JP/EN
- Telegram approval workflow text templates

---

## 2. Page structure

### A. Homepage
Purpose:
- explain brand quickly
- set premium expectation
- clarify walk-in first model
- direct users to menu or reservation request

Sections:
1. Header / navigation
2. Hero
3. Brand positioning
4. How it works
5. Signature premium bowl preview
6. Walk-in vs reservation explanation
7. Reservation CTA
8. Access / basic info
9. Footer

### B. Menu page
Purpose:
- show premium bowl choices clearly
- show optional toppings and drinks
- support both walk-in and reservation understanding

Sections:
1. Header
2. Menu intro
3. Premium bowls
4. Optional toppings
5. Drinks
6. Reservation note
7. CTA to reservation page
8. Footer

### C. Reservation / Pre-order page
Purpose:
- collect premium bowl selections per person
- collect booking details
- present request-only logic clearly

Sections:
1. Header
2. Reservation intro / policy summary
3. Step indicator
4. Party size + per-person order builder
5. Date and fixed arrival time selection
6. Contact details
7. Notes / special requests
8. Review summary
9. Submit CTA
10. Footer

### D. Confirmation / Thank-you page
Purpose:
- confirm request received
- make clear it is pending review
- set next expectation

Sections:
1. Thank-you message
2. Pending confirmation notice
3. Request summary snapshot
4. Expected next step
5. Return links

---

## 3. Section-by-section layout draft

## Homepage layout

### 1. Header / navigation
- Logo / wordmark placeholder
- EN / JP toggle
- Links: Home, Menu, Reserve
- Sticky mobile-first header

### 2. Hero
- Large image placeholder
- Headline: premium tuna bowl positioning
- Short subtext: near Sensoji / premium bowl / crafted quality
- Primary CTA: Reserve Premium Bowl
- Secondary CTA: View Menu

### 3. Brand positioning
- Short paragraph from current site-derived messaging
- Focus points:
  - premium maguro bowl
  - akazu rice
  - quality/craftsmanship
  - Asakusa location

### 4. How it works
Three simple cards:
- Walk in anytime
- Priority reservation is for premium bowl pre-order
- We confirm after reviewing your request

### 5. Signature premium bowl preview
- 2–4 featured bowl cards
- Placeholder photos for now
- Short descriptions only
- Price field editable later

### 6. Walk-in vs reservation explanation
Two-column block:
- Walk-in: standard flow, depending on availability
- Reservation request: premium bowl pre-order, limited slots

### 7. Reservation CTA
- Premium, limited positioning
- Short note that reservations are not instant confirmations
- CTA button to reservation page

### 8. Access / basic info
- Address placeholder
- Hours placeholder
- Google Maps link placeholder
- Nearby landmark mention

### 9. Footer
- Contact placeholders
- Copyright
- Social placeholders

---

## Menu page layout

### 1. Menu intro
- Short explanation that menu shown is for current premium reservation flow + walk-in reference

### 2. Premium bowls section
Each item card should support:
- name EN
- name JP
- short description
- price
- tag (signature / limited / recommended)
- image placeholder

### 3. Optional toppings section
List or cards with:
- topping name
- price
- short description optional

### 4. Drinks section
Simple list/cards:
- drink name
- price
- category if needed

### 5. Reservation note
- Reservations are for premium bowl pre-order only
- Final confirmation sent after review

### 6. CTA
- Button to reserve

---

## Reservation page layout

### 1. Intro / policy summary
Short bullet area:
- Walk-in first restaurant
- Reservation requests are limited and for premium bowl pre-order only
- Submission does not guarantee confirmation
- We will contact you after review

### 2. Step indicator
- Step 1: Party & Order
- Step 2: Date & Time
- Step 3: Contact Info
- Step 4: Review & Submit

### 3. Party size + order builder
Flow:
- Select party size
- Auto-generate one order block per person
- Each person block includes:
  - Person label (Guest 1, Guest 2...)
  - Premium bowl required (single select)
  - Toppings optional (multi-select)
  - Drink optional (single select)
  - Optional note for that person

Rules:
- Number of person blocks must equal party size
- Each person must select exactly one premium bowl
- Toppings and drink are optional
- Data structure should be easy to expand later

### 4. Date and fixed arrival time
Fields:
- reservation date
- arrival time slot

Logic:
- show only fixed slots
- keep slot/capacity rules config-driven
- leave room later for sold-out slot display

### 5. Contact details
Fields:
- full name
- email
- phone
- notes / special requests

### 6. Review summary
Show:
- party size
- each guest’s bowl/toppings/drink
- date
- arrival time
- customer details
- pending confirmation notice

### 7. Submit CTA
Button text should signal request, not confirmed booking:
- EN: Submit Reservation Request
- JP: 予約リクエストを送信

### 8. Post-submit workflow note
- Draft reply is prepared internally
- Reservation remains pending until approved and confirmed

---

## Thank-you page layout

### Content
- headline: request received
- status: pending confirmation
- short explanation that team will review and reply
- optional request reference placeholder
- link back to home / menu

Suggested wording direction:
- calm
- premium
- not mass-market
- no instant-booking tone

---

## 4. Reservation form structure

## Customer fields
- fullName
- email
- phone
- partySize
- reservationDate
- arrivalTime
- notes
- languageDetected

## Per-person order structure
```json
{
  "guests": [
    {
      "guestLabel": "Guest 1",
      "premiumBowlId": "signature-maguro-don",
      "toppingIds": ["ikura", "otoro-add-on"],
      "drinkId": "green-tea",
      "guestNote": "No wasabi"
    }
  ]
}
```

## Editable config structure
```json
{
  "premiumBowls": [],
  "toppings": [],
  "drinks": [],
  "timeSlots": [],
  "bookingRules": {
    "slotCapacityDefault": 4,
    "advanceBookingDays": 14,
    "closedDays": []
  }
}
```

## Validation rules
- party size must be at least 1
- guest blocks must equal party size
- each guest must choose one premium bowl
- reservation date required
- arrival time required
- full name required
- email required
- phone required
- submit as request only

## Draft reply workflow structure
After submit:
1. Build request summary
2. Detect likely customer language from chosen page language / entered content
3. Generate draft reply in matching language
4. Send draft to Raymond on Telegram
5. Wait for Raymond approval
6. Only then send confirmation/reply outward

## Draft reply content should include
- customer name
- requested date/time
- party size
- selected bowls
- pending / approved / adjustment-needed status template

---

## 5. Required now vs later

## Required now
1. Actual workspace folder path for website materials
2. Current official business details to display:
   - restaurant name format
   - address
   - hours
   - map link
   - contact method(s)
3. Initial premium bowl list
   - even rough names are enough
4. Initial fixed arrival slots
   - even temporary assumptions are enough
5. Where Telegram draft notifications should go
   - this direct chat or another target

## Can be added later
1. Final photos
2. Final brand copy
3. Final menu descriptions
4. Final prices
5. Slot capacities by day/time
6. Closed-day calendar rules
7. Auto-generated reference numbers
8. FAQ content
9. Allergy guidance text
10. Final confirmation message wording
11. Advanced admin dashboard or database
12. Payment/deposit logic if ever needed later

---

## 6. Recommended next build step

Build the first portable prototype with:
- real page files
- shared stylesheet
- editable config file
- reservation form that generates per-person order blocks
- thank-you flow with placeholder draft notification logic

That gives a working framework now and keeps Hostinger migration easy later.
