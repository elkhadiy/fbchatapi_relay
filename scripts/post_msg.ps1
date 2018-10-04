# Requires -Version 3

param([String]$email, [String]$threadid, [String]$msg)

$headerFile = ".session_header_" + $email + ".xml"

$header = Import-CliXml $headerFile

$uri = "https://messenger4business.elkrafts.xyz/message/" + $threadid

$body = @{
  "body"= "$msg"
}

Invoke-RestMethod -Uri $uri -Method 'Post' -Body $(ConvertTo-Json $body) -Headers $header
