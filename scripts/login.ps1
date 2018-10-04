#Requires -Version 3

$email = Read-host "Email"
$pw = Read-host -AsSecureString "Password"
$pw = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pw))

$body = @{
  "email"="$email"
  "password"="$pw"
}

$header = @{
  "Accept"="application/json"
  "Content-Type"="application/json"
}

$token = Invoke-RestMethod -Uri "https://messenger4business.elkrafts.xyz/login" -Method 'Post' -Body $(ConvertTo-Json $body) -Headers $header

$header = @{
  "Accept"="application/json"
  "Content-Type"="application/json"
  "Authorization"=$token.authorization
}

$headerFile = ".session_header_" + $email + ".xml"

$header | Export-CliXml $headerFile
