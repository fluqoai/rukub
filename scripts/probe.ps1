$ErrorActionPreference = 'SilentlyContinue'
$base = "http://localhost:3000"
function Probe($method, $url) {
  $params = @{
    Uri = $url; Method = $method; UseBasicParsing = $true; TimeoutSec = 30
    Headers = @{ "Content-Type" = "application/json" }
  }
  try {
    $r = Invoke-WebRequest @params
    Write-Host ("OK   {0,-7} {1,-32} len={2,5}" -f $r.StatusCode, $url, $r.Content.Length)
  } catch {
    $code = 0
    if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
    Write-Host ("FAIL {0,-7} {1,-32}" -f $code, $url)
  }
}
Probe GET "$base/"
Probe GET "$base/shop/women"
Probe GET "$base/shop/men"
Probe GET "$base/shop/shared"
Probe GET "$base/api/orders"
Probe GET "$base/admin"
Probe GET "$base/admin/orders"
Probe GET "$base/checkout"
Probe GET "$base/checkout/success"
Probe GET "$base/orders"
