const emailText = document.getElementById("femail");
const emailSubmitButton = document.getElementById("fbutton");


function containsCreditCardNumber(text) {
    // Regular expression to detect possible credit card patterns (13-19 digits)
    const ccRegex = /\b(?:\d[ -]*?){13,19}\b/g;
    
    // Extract potential matches
    let matches = text.match(ccRegex);
    
    if (!matches) return false; // No matches found

    // Validate using Luhn algorithm
    for (let match of matches) {
        let cleanedNumber = match.replace(/\D/g, ''); // Remove spaces/dashes

        if (isValidCreditCard(cleanedNumber)) {
            return true; // Found a valid credit card number
        }
    }

    return false; // No valid numbers found
}

// Luhn Algorithm to validate credit card number
function isValidCreditCard(number) {
    let sum = 0;
    let alternate = false;
    
    for (let i = number.length - 1; i >= 0; i--) {
        let digit = parseInt(number[i]);

        if (alternate) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }

        sum += digit;
        alternate = !alternate;
    }

    return sum % 10 === 0; // Valid if sum is a multiple of 10
}

function checkEmail(){
    let popuptext = "This Email does not contain a credit card";
    const hasCreditCardNumber = containsCreditCardNumber(emailText.value);
    if (hasCreditCardNumber){
        popuptext = "This email contains a credit card";
    }

    alert(popuptext)
    console.log(emailText)

}





// Test cases
//const testCases = [
//    { text: "Hello, please process my payment with 4111111111111111. Thanks!", expected: true },
//    { text: "Hi, my new card is 4111 1111 1111 1111. Let me know if you need anything else.", expected: true },
//    { text: "Dear customer support, I made a mistake while entering my card 5500-0000-0000-0004. Can you update it?", expected: true },
//    { text: "Hey Mike, just booked the hotel! Used my card 6011 0000 0000 0004 for the reservation.", expected: true },
//    { text: "Thanks for the help! By the way, my new card is 3400-000000-00009, but don't share it.", expected: true },
//    { text: "My phone number is 987-654-3210, and my zip code is 10001.", expected: false },
//    { text: "Here's my card number: 1234-5678-9101-1121.", expected: false },
//    { text: "Hey, can we meet on 2024-10-15 at 10:30 AM?", expected: false },
//    { text: "The invoice number is 4011-2345-6789, but that’s not my card.", expected: false },
//    { text: "My card ends in 1234. Let me know if you need the rest.", expected: false }
//];
//
//// Run tests
//testCases.forEach((test, index) => {
//    const result = containsCreditCardNumber(test.text);
//    console.log(`Test Case ${index + 1}: ${result === test.expected ? "✅ Passed" : "❌ Failed"}`);
//});
