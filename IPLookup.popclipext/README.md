# IP Lookup

Look up basic information about an IPv4 or IPv6 address from selected text.

## Features

- Supports both IPv4 and IPv6
- Shows a compact result in PopClip
- Opens a full details page in the browser

## Data Sources

- Query API: [IP.SB](https://ip.sb/)
- Details page: [IPinfo](https://ipinfo.io/)

## Privacy

When you trigger this extension, the selected IP address is sent to the lookup service over HTTPS in order to fetch public IP metadata.

## Notes

- The compact PopClip result is intentionally short because PopClip truncates long result text.
- The details page action opens `https://ipinfo.io/<ip>` in your browser.

## Author

Created by Vic Liu.

## Changelog

- 2026-03-08: Added English and Chinese localizations, publish-ready metadata, and README.
- 2026-03-08: Initial release.
