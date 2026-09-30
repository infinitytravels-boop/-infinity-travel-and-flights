INFINITY TRAVEL AND FLIGHTS — VERSION 4

Included:
- Responsive public website
- Flight request form emailed through FormSubmit
- Secure Flutterwave hosted payment flow
- USD / EUR / GBP payment choices
- Server-side transaction verification
- Flutterwave webhook endpoint with verif-hash checking
- Payment result page
- Booking/payment information section
- No card details stored by the website

BUSINESS DETAILS
Name: Infinity Travel and Flights
Phone/WhatsApp: (220) 247-9118
Email: jamesmitchell75b@gmail.com

IMPORTANT
This package is not a live website yet. You must:
1. Create/verify your Flutterwave merchant account.
2. Enable the card payment methods you are approved to use.
3. Put FLW_SECRET_KEY and FLW_SECRET_HASH in the hosting provider's server environment variables.
4. Set BASE_URL to the real HTTPS domain.
5. Configure the Flutterwave webhook URL as:
   https://YOUR-DOMAIN/flw-webhook
6. Complete the first FormSubmit confirmation email after the first flight-request submission.
7. Test with Flutterwave test credentials before switching to live credentials.
8. After a successful payment, verify the transaction before ticketing.

SECURITY
Never put FLW_SECRET_KEY in index.html or script.js and never send the secret key through chat.
