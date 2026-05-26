$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$screenshots = Join-Path $root "screenshots"
New-Item -ItemType Directory -Force -Path $screenshots | Out-Null

Add-Type -AssemblyName System.Drawing

function New-ProofImage {
    param(
        [string]$Path,
        [string]$Title,
        [string]$Subtitle,
        [string[]]$Bullets
    )

    $bitmap = New-Object System.Drawing.Bitmap 1600, 1000
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.Clear([System.Drawing.Color]::FromArgb(7, 10, 15))

    $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(11, 18, 32))
    $accentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 255, 139))
    $altAccentBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(25, 199, 255))
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(233, 243, 255))
    $mutedBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(171, 186, 201))
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(42, 111, 88), 2)

    $graphics.FillRectangle($panelBrush, 48, 48, 1504, 904)
    $graphics.DrawRectangle($borderPen, 48, 48, 1504, 904)

    $eyebrowFont = New-Object System.Drawing.Font("Segoe UI", 16, [System.Drawing.FontStyle]::Bold)
    $titleFont = New-Object System.Drawing.Font("Georgia", 34, [System.Drawing.FontStyle]::Bold)
    $bodyFont = New-Object System.Drawing.Font("Segoe UI", 18)
    $bulletFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)

    $graphics.DrawString("M365 Retention Case Orchestrator", $eyebrowFont, $accentBrush, 92, 92)
    $graphics.DrawString($Title, $titleFont, $textBrush, 92, 142)
    $graphics.DrawString($Subtitle, $bodyFont, $mutedBrush, 92, 214)

    $y = 320
    foreach ($bullet in $Bullets) {
        $graphics.DrawString("•", $bulletFont, $altAccentBrush, 108, $y)
        $graphics.DrawString($bullet, $bodyFont, $textBrush, 138, $y + 2)
        $y += 82
    }

    $graphics.DrawString("Synthetic proof render for README packaging.", $bodyFont, $mutedBrush, 92, 880)
    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
    $graphics.Dispose()
    $bitmap.Dispose()
}

New-ProofImage -Path (Join-Path $screenshots "01-overview-proof.png") `
    -Title "Overview proof" `
    -Subtitle "Retention coverage, label-quality drift, stale matters, and custodian hold health in one Purview operator surface." `
    -Bullets @(
        "Disabled workload coverage is raised before audit-time surprises hit.",
        "Label disposition gaps stay visible instead of buried in raw export fields.",
        "Case and hold posture map directly into a remediation packet."
    )

New-ProofImage -Path (Join-Path $screenshots "02-retention-lane-proof.png") `
    -Title "Retention lane" `
    -Subtitle "Every lane keeps owner, workload focus, status, and next action visible." `
    -Bullets @(
        "Records, collaboration, and case lanes stay separated cleanly.",
        "Disabled Teams retention remains obvious.",
        "Case ownership gaps are easy to scan."
    )

New-ProofImage -Path (Join-Path $screenshots "03-case-risks-proof.png") `
    -Title "Case risks" `
    -Subtitle "Findings map severity, owner, subject, custodian, and the exact rule that fired." `
    -Bullets @(
        "High-severity hold and case failures surface first.",
        "Owner mapping keeps Purview and legal-ops accountability explicit.",
        "The lane is grounded in Microsoft Graph retention and case exports."
    )

New-ProofImage -Path (Join-Path $screenshots "04-disposition-posture-proof.png") `
    -Title "Disposition posture" `
    -Subtitle "Packets tie completeness, blocker, owner, and review timing together." `
    -Bullets @(
        "Workload coverage, matter health, and label posture stay readable.",
        "Red/yellow/green review posture is easy to scan.",
        "The system is shaped for real Microsoft 365 compliance proof."
    )
