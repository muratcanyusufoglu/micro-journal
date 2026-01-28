#!/bin/bash
# Test deep link on simulator
echo "Testing deep link: oneline://capture?text=Test"
xcrun simctl openurl booted "oneline://capture?text=Test%20from%20script"
echo "Deep link sent. Check Metro console for logs."
