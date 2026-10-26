# Désactive / réactive les écrans dans le Gestionnaire de périphériques (classe Moniteurs), comme un
# clic droit > Désactiver l'appareil. Exécuté avec les droits administrateur par deux tâches planifiées
# créées une seule fois (une seule fenêtre UAC) ; le script est copié dans un dossier que seul un
# administrateur peut modifier.
#   -Mode off : désactive les écrans actifs, sauf ceux à garder (monitors-keep.json, écrit par l'app),
#               et retient lesquels
#   -Mode on  : réactive ceux que l'app a désactivés
param([ValidateSet('off', 'on')][string]$Mode = 'on')

$dir = Join-Path $env:ProgramData 'Precise Gunplay'
$stateFile = Join-Path $dir 'monitors-state.json'
$resultFile = Join-Path $dir 'monitors-result.json'
$keepFile = Join-Path $dir 'monitors-keep.json'

function Read-State {
  try { return @((Get-Content $stateFile -Raw | ConvertFrom-Json).ids | Where-Object { $_ }) } catch { return @() }
}
# Seul fichier modifiable par le compte : il ne peut que retirer des écrans de la désactivation.
function Read-Keep {
  try { return @((Get-Content $keepFile -Raw | ConvertFrom-Json).ids | Where-Object { $_ }) } catch { return @() }
}
function Write-State($ids) {
  @{ ids = @($ids | Where-Object { $_ }) } | ConvertTo-Json | Set-Content -Path $stateFile -Encoding UTF8
}
function Get-Status($ids) {
  $map = @{}
  foreach ($id in $ids) { try { $map[$id] = (Get-PnpDevice -InstanceId $id -ErrorAction Stop).Status } catch { $map[$id] = 'inconnu' } }
  return $map
}
# Voie rapide : pnputil en parallèle (processus léger), puis une seule vérification pour tous.
function Invoke-PnpUtil($flag, $ids) {
  $procs = foreach ($id in $ids) { Start-Process pnputil.exe -ArgumentList $flag, "`"$id`"" -WindowStyle Hidden -PassThru }
  foreach ($p in $procs) { if (-not $p.WaitForExit(20000)) { try { $p.Kill() } catch {} } }
  Start-Sleep -Milliseconds 300
}

$names = @{}
$disabled = @(); $failed = @()
try {
  $devices = @(Get-PnpDevice -Class Monitor -PresentOnly -ErrorAction SilentlyContinue)
  foreach ($d in $devices) { $names[$d.InstanceId] = $d.FriendlyName }

  if ($Mode -eq 'off') {
    $keep = @(Read-Keep)
    $targets = @($devices | Where-Object { $_.Status -eq 'OK' -and $keep -notcontains $_.InstanceId } | ForEach-Object { $_.InstanceId })
    if ($targets.Count) {
      Invoke-PnpUtil '/disable-device' $targets
      # Récalcitrants (encore actifs) : cmdlet PnP, 3 tentatives avec vérification de l'état réel.
      foreach ($id in $targets) {
        for ($i = 0; $i -lt 3 -and (Get-Status @($id))[$id] -eq 'OK'; $i++) {
          try { Disable-PnpDevice -InstanceId $id -Confirm:$false -ErrorAction Stop } catch {}
          Start-Sleep -Milliseconds 600
        }
      }
      $status = Get-Status $targets
      $disabled = @($targets | Where-Object { $status[$_] -ne 'OK' })
      $failed = @($targets | Where-Object { $status[$_] -eq 'OK' })
      Write-State @(@(Read-State) + $disabled | Where-Object { $_ } | Select-Object -Unique)
    }
  } else {
    $ids = @(Read-State)
    if ($ids.Count) {
      Invoke-PnpUtil '/enable-device' $ids
      # Récalcitrants : cmdlet puis pnputil, 5 tentatives (la reconfiguration du bureau après la
      # première réactivation peut faire échouer la suivante).
      foreach ($id in $ids) {
        for ($i = 0; $i -lt 5 -and (Get-Status @($id))[$id] -ne 'OK'; $i++) {
          try { Enable-PnpDevice -InstanceId $id -Confirm:$false -ErrorAction Stop } catch {}
          Start-Sleep -Milliseconds 1200
          if ((Get-Status @($id))[$id] -ne 'OK') { & pnputil.exe /enable-device "$id" | Out-Null; Start-Sleep -Milliseconds 1200 }
        }
      }
      $status = Get-Status $ids
      $disabled = @($ids | Where-Object { $status[$_] -ne 'OK' })
      $failed = $disabled
      Write-State $disabled
    }
  }
  $result = @{ mode = $Mode; disabled = @($disabled | ForEach-Object { $names[$_] }); failed = @($failed | ForEach-Object { $names[$_] }) }
} catch {
  $result = @{ mode = $Mode; error = $_.Exception.Message }
}
$result.at = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
$result | ConvertTo-Json | Set-Content -Path $resultFile -Encoding UTF8
