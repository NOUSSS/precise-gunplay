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
