$path = '.\business.html'
$content = Get-Content -Path $path -Raw -Encoding UTF8

$content = $content -replace ' cursor: pointer;" onclick="showDetail\(''industrial''\)"', '"'
$content = $content -replace ' cursor: pointer;" onclick="showDetail\(''disaster''\)"', '"'
$content = $content -replace ' cursor: pointer;" onclick="showDetail\(''service''\)"', '"'

$content = $content -replace '(?s)<div id="detail-industrial".*?<section class="use-cases-section">', '<section class="use-cases-section" style="margin-top: 150px;">'

$content = $content -replace '(?s)<script>\s*function showDetail.*?function changeTimeline.*?</script>', ''

Set-Content -Path $path -Value $content -Encoding UTF8
Write-Output "Update completed successfully"
