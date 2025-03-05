# Pre-Push Checklist

Before pushing your changes to GitHub, please ensure you've completed the following tasks:

## Code Quality

- [x] Fix the syntax error in `src/components/subscription/PricingSection.tsx` around line 250
- [x] Remove or comment out critical console.log statements that might expose sensitive information
- [ ] Consider removing debugging console.log statements
- [x] Run `node scripts/clean-logs.js` to identify console.log statements that should be removed

## Environment Variables

- [x] Ensure all required PayU environment variables are set in `.env`:
  - [x] `VITE_PAYU_PUBLIC_KEY`
  - [x] `VITE_PAYU_MERCHANT_ID`
  - [x] `VITE_PAYU_ACCOUNT_ID`
  - [x] `VITE_PAYU_API_KEY`
  - [x] `VITE_PAYU_API_LOGIN`
- [x] Make sure `.env` is in `.gitignore` to prevent pushing sensitive information

## Testing

- [ ] Test the Terms of Service acceptance flow:
  - [ ] Sign up as a new user
  - [ ] Accept the Terms of Service
  - [ ] Verify you're redirected to the subscription page
- [ ] Test the payment flow:
  - [ ] Enter payment details on the subscription page
  - [ ] Complete the payment process
  - [ ] Verify the payment result page shows the correct status

## Clean Up

- [x] Kill all running development server instances with `pkill -f "vite"`
- [x] Remove any temporary files or debugging code
- [x] Ensure no sensitive information is being logged or exposed

## Documentation

- [x] Update README.md if necessary
- [x] Document any new environment variables or configuration requirements
- [x] Document any changes to the payment flow or authentication process

## Final Check

- [x] Run the application one last time to verify everything works as expected
- [ ] Check for any linting errors or warnings (Note: There are some ESLint configuration issues that need to be addressed in a future update)
- [ ] Verify all tests pass

## Additional Resources

- [x] Created `PAYMENT_FLOW.md` with detailed documentation of the payment system
- [x] Created `scripts/cleanup-dev-servers.js` to help clean up development servers before pushing
- [x] Created `scripts/clean-logs.js` to identify console.log statements that should be removed
- [x] Created `scripts/remove-critical-logs.js` to remove console.log statements with sensitive information
- [x] Created `scripts/pre-push-check.js` to run a final check before pushing

Once you've completed all these tasks, you're ready to push your changes to GitHub! 