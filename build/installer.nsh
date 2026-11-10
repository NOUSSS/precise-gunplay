; Mise à jour silencieuse : sans fenêtre, l'utilisateur croit l'app plantée et risque de la relancer
; pendant que ses fichiers sont remplacés. On affiche une petite fenêtre jusqu'à la relance.
!macro customInit
  !ifndef BUILD_UNINSTALLER
    ${if} ${isUpdated}
      Banner::show /set 76 "Mise à jour de Precise Gunplay…" "L'app va se relancer automatiquement."
    ${endIf}
  !endif
!macroend

!macro customInstall
  ${if} ${isUpdated}
    Banner::destroy
  ${endIf}
!macroend

; Remplace la vérification « app en cours d'exécution » d'electron-builder, lente lors d'une mise à jour :
; elle attend 300 ms à l'aveugle, lance cmd + tasklist à chaque essai, puis ajoute encore 1 à 2 s de pauses
; dès que l'app n'est pas tout à fait fermée. Elle s'exécute deux fois (installeur + désinstalleur de l'ancienne version).
; Ici : sondage direct toutes les 100 ms, fermeture forcée au bout de 3 s si l'app ne s'est pas fermée.
!macro customCheckAppRunning
  ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
  ${if} $R0 == 0
    ${ifNot} ${isUpdated}
      MessageBox MB_OKCANCEL|MB_ICONEXCLAMATION "$(appRunning)" /SD IDOK IDOK +2
      Quit
    ${endIf}

    StrCpy $R1 0
    pgWaitForExit:
      Sleep 100
      ${nsProcess::FindProcess} "${APP_EXECUTABLE_FILENAME}" $R0
      ${if} $R0 == 0
        IntOp $R1 $R1 + 1
        ${if} $R1 < 30
          Goto pgWaitForExit
        ${endIf}
        ${nsProcess::KillProcess} "${APP_EXECUTABLE_FILENAME}" $R0
        Sleep 300
      ${endIf}
  ${endIf}
!macroend

; Désinstallation réelle (ni mise à jour, ni réinstallation par-dessus) : ce que la résolution étirée a posé
; hors du dossier de l'app est retiré. Les chemins viennent des variables d'environnement et non de $APPDATA :
; pour une installation « tous les utilisateurs », $APPDATA désigne ProgramData.
!macro customUnInstall
  Push $R0
  Push $R1
  Push $R2
  ${ifNot} ${isUpdated}
    ${GetParameters} $R0
    ClearErrors
    ${GetOptions} $R0 "/KEEP_APP_DATA" $R1
    ${if} ${Errors}
      ; Réglages vidéo de VALORANT : la lecture seule est retirée, seulement si c'est l'app qui la maintient
      ; (fonction activée avec le réglage automatique). Posée à la main par le joueur, elle reste.
      nsExec::Exec `"$SYSDIR\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -NonInteractive -Command "try { $$s = (Get-Content -Raw -LiteralPath (Join-Path $$env:APPDATA 'Precise Gunplay\settings.json') | ConvertFrom-Json).stretch; if ($$s.enabled -and $$s.gameConfig) { Get-ChildItem -LiteralPath (Join-Path $$env:LOCALAPPDATA 'VALORANT\Saved\Config') -Recurse -Filter GameUserSettings.ini | ForEach-Object { $$_.IsReadOnly = $$false } } } catch { }"`
      Pop $R1

      ; Dossier ProgramData demandé à Windows (CSIDL_COMMON_APPDATA = 0x23), pas lu dans une variable
      ; d'environnement : il part ensuite dans une commande élevée.
      StrCpy $R2 ""
      System::Call 'shell32::SHGetFolderPathW(p 0, i 0x23, p 0, i 0, w .R2)'
      ${if} $R2 != ""
      ${andIf} ${FileExists} "$R2\Precise Gunplay\monitors.ps1"
        ; Écrans que l'app aurait laissés désactivés : réactivés avant de retirer la tâche qui sait le faire.
        nsExec::Exec `"$SYSDIR\schtasks.exe" /run /tn "\Precise Gunplay\Ecrans on"`
        Pop $R1
        MessageBox MB_YESNO|MB_ICONQUESTION "Precise Gunplay a créé deux tâches planifiées pour la résolution étirée. Cliquez sur Oui pour les supprimer aussi. Windows vous demandera alors une autorisation." /SD IDNO IDNO pgKeepTasks
          Sleep 3000
          ; Fichiers nommés un par un, puis dossier supprimé seulement s'il est vide : jamais de suppression
          ; récursive avec des droits élevés dans un dossier qu'un autre compte a pu préparer.
          ExecShellWait "runas" "$SYSDIR\cmd.exe" `/c $SYSDIR\schtasks.exe /delete /tn "\Precise Gunplay\Ecrans off" /f & $SYSDIR\schtasks.exe /delete /tn "\Precise Gunplay\Ecrans on" /f & del /f /q "$R2\Precise Gunplay\monitors.ps1" "$R2\Precise Gunplay\monitors-state.json" "$R2\Precise Gunplay\monitors-result.json" "$R2\Precise Gunplay\monitors-target.json" "$R2\Precise Gunplay\install.json" & rd "$R2\Precise Gunplay"` SW_HIDE
        pgKeepTasks:
      ${endIf}
    ${endIf}
  ${endIf}
  Pop $R2
  Pop $R1
  Pop $R0
!macroend
