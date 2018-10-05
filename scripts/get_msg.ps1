# Requires -Version 3

param([String]$email, [String]$threadid)

$headerFile = ".session_header_" + $email + ".xml"

$header = Import-CliXml $headerFile

$uri = "https://messenger4business.elkrafts.xyz/messages/" + $threadid

Invoke-RestMethod -Uri $uri -Method 'Get' -Headers $header | ConvertTo-Json
