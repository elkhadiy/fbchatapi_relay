#Requires -Version 3

param([String]$email)

$headerFile = ".session_header_" + $email + ".xml"

$header = Import-CliXml $headerFile

Invoke-RestMethod `
  -Uri "https://messenger4business.elkrafts.xyz/friends" `
  -Method 'Get' `
  -Headers $header
