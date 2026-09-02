$ErrorActionPreference = 'SilentlyContinue'
$base = "http://localhost:3000"
$orderId = "RKB-E2E-" + (Get-Date -Format "yyyyMMddHHmmss")
$body = @{
  id = $orderId
  items = @(
    @{
      productId = "p_car_organizer_01"
      productName = "منظم السيارة المعلق - 4 قطع"
      productShortName = "منظم السيارة المعلق"
      quantity = 1
      price = 89
    }
    @{
      productId = "p_phone_holder_01"
      productName = "حامل الجوال المغناطيسي للوحة القيادة"
      productShortName = "حامل الجوال المغناطيسي"
      quantity = 2
      price = 65
    }
  )
  shipping = @{
    fullName = "أحمد محمد"
    phone = "0501234567"
    email = "ahmed@example.com"
    city = "الرياض"
    district = "العليا"
    notes = "اتصل قبل الوصول"
  }
  paymentMethod = "cod"
  subtotal = 219
  shippingCost = 0
  total = 219
  status = "pending"
} | ConvertTo-Json -Depth 8
Write-Host "=== POST /api/orders ==="
Write-Host "id: $orderId"
try {
  $r = Invoke-WebRequest -Uri "$base/api/orders" -Method POST -UseBasicParsing -TimeoutSec 30 -Headers @{ "Content-Type" = "application/json" } -Body $body
  Write-Host ("OK   {0,-7} len={1,5}" -f $r.StatusCode, $r.Content.Length)
  $j = $r.Content | ConvertFrom-Json
  Write-Host "order.id        = $($j.order.id)"
  Write-Host "order.status    = $($j.order.status)"
  Write-Host "order.total     = $($j.order.total)"
  Write-Host "order.customer  = $($j.order.customer_id)"
} catch {
  $code = 0
  $rb = ""
  if ($_.Exception.Response) {
    $code = [int]$_.Exception.Response.StatusCode
    $s = $_.Exception.Response.GetResponseStream()
    if ($s) { $rdr = New-Object System.IO.StreamReader($s); $rb = $rdr.ReadToEnd() }
  }
  Write-Host "FAIL $code"
  Write-Host $rb
}
Write-Host ""
Write-Host "=== GET /api/orders ==="
try {
  $r = Invoke-WebRequest -Uri "$base/api/orders?limit=5" -Method GET -UseBasicParsing -TimeoutSec 30
  $j = $r.Content | ConvertFrom-Json
  Write-Host ("OK   {0,-7} count={1}" -f $r.StatusCode, $j.orders.Count)
  $j.orders | Select-Object -First 5 | ForEach-Object {
    Write-Host ("  - {0} status={1} total={2} city={3}" -f $_.id, $_.status, $_.total, $_.shipping_city)
  }
} catch {
  Write-Host "FAIL"
}
Write-Host ""
Write-Host "=== GET /api/orders/$orderId ==="
try {
  $r = Invoke-WebRequest -Uri "$base/api/orders/$orderId" -Method GET -UseBasicParsing -TimeoutSec 30
  $j = $r.Content | ConvertFrom-Json
  Write-Host ("OK   {0,-7} items={1}" -f $r.StatusCode, $j.order.items.Count)
  $j.order.items | ForEach-Object { Write-Host ("    - {0} x{1} = {2} SAR" -f $_.product_short_name, $_.quantity, $_.subtotal) }
} catch {
  $code = 0
  $rb = ""
  if ($_.Exception.Response) {
    $code = [int]$_.Exception.Response.StatusCode
    $s = $_.Exception.Response.GetResponseStream()
    if ($s) { $rdr = New-Object System.IO.StreamReader($s); $rb = $rdr.ReadToEnd() }
  }
  Write-Host "FAIL $code"
  Write-Host $rb
}
Write-Host ""
Write-Host "=== PATCH /api/orders/$orderId  (status=confirmed) ==="
$patchBody = @{ status = "confirmed" } | ConvertTo-Json
try {
  $r = Invoke-WebRequest -Uri "$base/api/orders/$orderId" -Method PATCH -UseBasicParsing -TimeoutSec 30 -Headers @{ "Content-Type" = "application/json" } -Body $patchBody
  $j = $r.Content | ConvertFrom-Json
  Write-Host ("OK   {0,-7} status={1}" -f $r.StatusCode, $j.order.status)
} catch {
  $code = 0
  $rb = ""
  if ($_.Exception.Response) {
    $code = [int]$_.Exception.Response.StatusCode
    $s = $_.Exception.Response.GetResponseStream()
    if ($s) { $rdr = New-Object System.IO.StreamReader($s); $rb = $rdr.ReadToEnd() }
  }
  Write-Host "FAIL $code"
  Write-Host $rb
}
