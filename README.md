# Leak Lock - Email Security Extension

[GitHub Repository](https://github.com/MalachiR64/data-leak-preventor)

## Overview
Leak Lock is a Chrome extension designed to protect users from accidentally sending sensitive information through Gmail. It scans email content in real-time for sensitive data like credit card numbers and Social Security Numbers (SSNs).

## Features
- Real-time scanning of email content
- Detection of valid credit card numbers using the Luhn algorithm
- Social Security Number (SSN) pattern recognition
- Warning prompts before sending emails containing sensitive data
- Toggle functionality to enable/disable warnings
- Simple and intuitive user interface

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/MalachiR64/data-leak-preventor.git
   ```
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the "Data Leak Project" folder

## Usage
1. Click the Leak Lock icon in your Chrome toolbar
2. Enable "Sensitive Data Warnings" using the toggle switch
3. When composing an email in Gmail, the extension will automatically scan for sensitive data
4. If sensitive information is detected, you'll receive a warning before sending

## Security Features
- Validates credit card numbers using the Luhn algorithm
- Detects common SSN patterns (###-##-####)
- Provides real-time feedback while composing emails
- Requires explicit confirmation before sending emails with sensitive data

## Contributing
Feel free to submit issues and enhancement requests via GitHub Issues.

## Links
- [Leak Lock Website](https://leaklock.carrd.co/#)
- [GitHub Repository](https://github.com/MalachiR64/data-leak-preventor)

## License
This project is licensed under the MIT License.