#!/bin/zsh
first=$(/usr/bin/python3 "${0:A:h}/lookup.py" --first-ip)
if [[ -n "$first" ]]; then
  open "https://ipinfo.io/${first}"
fi
