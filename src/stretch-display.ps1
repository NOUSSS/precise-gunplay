# Assistant d'affichage pour la résolution étirée : lancé une fois par l'app, il répond ligne par ligne
# sur stdin/stdout. Aucun accès au jeu : liste des processus par instantané Toolhelp (comme le
# Gestionnaire des tâches), recherche de fenêtre par titre, réglages d'affichage Windows standard.
#   procs <nom1> <nom2>          -> {"run":[true,false],"window":true}
#   display                      -> écran principal, mode actuel et modes disponibles
#   apply <gdi> <l> <h> <hz>     -> {"ok":true} ou {"error":"..."}
#   primary                      -> {"id":"DISPLAY\\..."} : périphérique « Moniteurs » de l'écran principal
$ErrorActionPreference = 'Stop'
Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public static class PgStretch
{
    const int ENUM_CURRENT_SETTINGS = -1;
    const uint CDS_TEST = 0x2;
    const int DM_PELSWIDTH = 0x80000, DM_PELSHEIGHT = 0x100000, DM_DISPLAYFREQUENCY = 0x400000;
    const int DISPLAY_DEVICE_ACTIVE = 0x1, DISPLAY_DEVICE_PRIMARY_DEVICE = 0x4;
    const int EDD_GET_DEVICE_INTERFACE_NAME = 0x1;
    const uint TH32CS_SNAPPROCESS = 0x2;

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct DISPLAY_DEVICE
    {
        public int cb;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string DeviceName;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)] public string DeviceString;
        public int StateFlags;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)] public string DeviceID;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 128)] public string DeviceKey;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct DEVMODE
    {
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmDeviceName;
        public short dmSpecVersion, dmDriverVersion, dmSize, dmDriverExtra;
        public int dmFields, dmPositionX, dmPositionY, dmDisplayOrientation, dmDisplayFixedOutput;
        public short dmColor, dmDuplex, dmYResolution, dmTTOption, dmCollate;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 32)] public string dmFormName;
        public short dmLogPixels;
        public int dmBitsPerPel, dmPelsWidth, dmPelsHeight, dmDisplayFlags, dmDisplayFrequency;
        public int dmICMMethod, dmICMIntent, dmMediaType, dmDitherType, dmReserved1, dmReserved2, dmPanningWidth, dmPanningHeight;
    }

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    struct PROCESSENTRY32W
    {
        public uint dwSize, cntUsage, th32ProcessID;
        public IntPtr th32DefaultHeapID;
        public uint th32ModuleID, cntThreads, th32ParentProcessID;
        public int pcPriClassBase;
        public uint dwFlags;
        [MarshalAs(UnmanagedType.ByValTStr, SizeConst = 260)] public string szExeFile;
    }

    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern bool EnumDisplayDevices(string dev, int n, ref DISPLAY_DEVICE dd, int flags);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern bool EnumDisplaySettings(string dev, int n, ref DEVMODE dm);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int ChangeDisplaySettingsEx(string dev, ref DEVMODE dm, IntPtr hwnd, uint flags, IntPtr lParam);
    [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern IntPtr FindWindow(string cls, string title);
    [DllImport("kernel32.dll")] static extern IntPtr CreateToolhelp32Snapshot(uint flags, uint pid);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern bool Process32FirstW(IntPtr snap, ref PROCESSENTRY32W pe);
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern bool Process32NextW(IntPtr snap, ref PROCESSENTRY32W pe);
    [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);

    static DEVMODE NewDevMode()
    {
        DEVMODE dm = new DEVMODE();
        dm.dmSize = (short)Marshal.SizeOf(typeof(DEVMODE));
        return dm;
    }

    static string Str(string s)
    {
        return "\"" + (s ?? "").Replace("\\", "\\\\").Replace("\"", "\\\"") + "\"";
    }

    public static string Procs(string[] names)
    {
        bool[] run = new bool[names.Length];
        IntPtr snap = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if (snap != IntPtr.Zero && snap != new IntPtr(-1))
        {
            try
            {
                PROCESSENTRY32W pe = new PROCESSENTRY32W();
                pe.dwSize = (uint)Marshal.SizeOf(typeof(PROCESSENTRY32W));
                if (Process32FirstW(snap, ref pe))
                {
                    do
                    {
                        string n = (pe.szExeFile ?? "").ToLowerInvariant();
                        for (int i = 0; i < names.Length; i++) if (n == names[i]) run[i] = true;
                    } while (Process32NextW(snap, ref pe));
                }
            }
            finally { CloseHandle(snap); }
        }
        // La fenêtre du jeu se ferme ~15-20 s avant la fin du processus : elle sert à restaurer plus tôt.
        bool window = FindWindow("UnrealWindow", "VALORANT") != IntPtr.Zero || FindWindow(null, "VALORANT") != IntPtr.Zero;
        StringBuilder sb = new StringBuilder("{\"run\":[");
        for (int i = 0; i < run.Length; i++) sb.Append(i > 0 ? "," : "").Append(run[i] ? "true" : "false");
        return sb.Append("],\"window\":").Append(window ? "true" : "false").Append("}").ToString();
    }

    // Écran principal (cible du changement de résolution), avec ses modes 32 bits.
    public static string Display()
    {
        for (int i = 0; ; i++)
        {
            DISPLAY_DEVICE dd = new DISPLAY_DEVICE();
            dd.cb = Marshal.SizeOf(typeof(DISPLAY_DEVICE));
            if (!EnumDisplayDevices(null, i, ref dd, 0)) break;
            if ((dd.StateFlags & DISPLAY_DEVICE_ACTIVE) == 0 || (dd.StateFlags & DISPLAY_DEVICE_PRIMARY_DEVICE) == 0) continue;

            DEVMODE cur = NewDevMode();
            if (!EnumDisplaySettings(dd.DeviceName, ENUM_CURRENT_SETTINGS, ref cur)) break;
            StringBuilder sb = new StringBuilder();
            sb.Append("{\"gdi\":").Append(Str(dd.DeviceName))
              .Append(",\"w\":").Append(cur.dmPelsWidth).Append(",\"h\":").Append(cur.dmPelsHeight).Append(",\"hz\":").Append(cur.dmDisplayFrequency)
              .Append(",\"modes\":[");
            HashSet<string> seen = new HashSet<string>();
            for (int m = 0; m < 1000; m++)
            {
                DEVMODE dm = NewDevMode();
                if (!EnumDisplaySettings(dd.DeviceName, m, ref dm)) break;
                if (dm.dmBitsPerPel != 32) continue;
                string key = dm.dmPelsWidth + "," + dm.dmPelsHeight + "," + dm.dmDisplayFrequency;
                if (!seen.Add(key)) continue;
                sb.Append(seen.Count > 1 ? "," : "").Append("[").Append(key).Append("]");
            }
            return sb.Append("]}").ToString();
        }
        return "{\"error\":\"Aucun écran principal actif.\"}";
    }

    // Identifiant PnP du moniteur de l'écran principal :
    // \\?\DISPLAY#GSM5B7F#5&2a1b&0&UID4353#{guid} -> DISPLAY\GSM5B7F\5&2a1b&0&UID4353
    public static string PrimaryMonitorId()
    {
        for (int i = 0; ; i++)
        {
            DISPLAY_DEVICE dd = new DISPLAY_DEVICE();
            dd.cb = Marshal.SizeOf(typeof(DISPLAY_DEVICE));
            if (!EnumDisplayDevices(null, i, ref dd, 0)) return null;
            if ((dd.StateFlags & DISPLAY_DEVICE_ACTIVE) == 0 || (dd.StateFlags & DISPLAY_DEVICE_PRIMARY_DEVICE) == 0) continue;
            DISPLAY_DEVICE mon = new DISPLAY_DEVICE();
            mon.cb = Marshal.SizeOf(typeof(DISPLAY_DEVICE));
            if (!EnumDisplayDevices(dd.DeviceName, 0, ref mon, EDD_GET_DEVICE_INTERFACE_NAME)) return null;
            string id = mon.DeviceID ?? "";
            if (id.StartsWith("\\\\?\\")) id = id.Substring(4);
            int k = id.IndexOf("#{");
            if (k >= 0) id = id.Substring(0, k);
            return id.Replace('#', '\\');
        }
    }

    // CDS_TEST d'abord : un mode refusé par le pilote n'est jamais appliqué (pas d'écran noir).
    // Sans CDS_UPDATEREGISTRY : changement dynamique, Windows revient au mode enregistré au redémarrage.
    static string ApplyOn(string gdi, int w, int h, int hz)
    {
        DEVMODE cur = NewDevMode();
        bool haveCur = EnumDisplaySettings(gdi, ENUM_CURRENT_SETTINGS, ref cur);
        DEVMODE dm = haveCur ? cur : NewDevMode();
        dm.dmPelsWidth = w;
        dm.dmPelsHeight = h;
        dm.dmDisplayFrequency = hz > 0 ? hz : (haveCur ? cur.dmDisplayFrequency : 60);
        dm.dmFields = (haveCur ? cur.dmFields : 0) | DM_PELSWIDTH | DM_PELSHEIGHT | DM_DISPLAYFREQUENCY;
        int r = ChangeDisplaySettingsEx(gdi, ref dm, IntPtr.Zero, CDS_TEST, IntPtr.Zero);
        if (r != 0) return "Mode " + w + "x" + h + " @ " + dm.dmDisplayFrequency + " Hz refusé par le pilote (code " + r + ").";
        r = ChangeDisplaySettingsEx(gdi, ref dm, IntPtr.Zero, 0, IntPtr.Zero);
        if (r != 0) return "Échec du changement de résolution (code " + r + ").";
        return null;
    }

    public static string Apply(string gdi, int w, int h, int hz)
    {
        string err = ApplyOn(gdi, w, h, hz);
        // Secours : mode du bureau par défaut (écran principal).
        if (err != null && ApplyOn(null, w, h, hz) == null) err = null;
        return err == null ? "{\"ok\":true}" : "{\"error\":" + Str(err) + "}";
    }
}
'@

[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::Out.WriteLine('{"ready":true}')
while ($null -ne ($line = [Console]::In.ReadLine())) {
  $a = $line.Trim().Split(' ')
  try {
    switch ($a[0]) {
      'procs' { $out = [PgStretch]::Procs([string[]]($a | Select-Object -Skip 1)) }
      'display' { $out = [PgStretch]::Display() }
      'apply' { $out = [PgStretch]::Apply($a[1], [int]$a[2], [int]$a[3], [int]$a[4]) }
      'primary' { $out = ConvertTo-Json -Compress -InputObject @{ id = [PgStretch]::PrimaryMonitorId() } }
      default { $out = '{"error":"Commande inconnue."}' }
    }
  } catch {
    $out = '{"error":"' + ($_.Exception.Message -replace '["\\]', ' ') + '"}'
  }
  [Console]::Out.WriteLine($out)
  [Console]::Out.Flush()
}
