# Assistant d'affichage pour la résolution étirée : lancé une fois par l'app, il répond ligne par ligne
# sur stdin/stdout. Aucun accès au jeu : liste des processus par instantané Toolhelp (comme le
# Gestionnaire des tâches), recherche de fenêtre par titre, réglages d'affichage Windows standard.
#   procs <nom1> <nom2>          -> {"run":[true,false],"window":true,"ww":1920,"wh":1080}
#   display                      -> écran principal, mode actuel et modes disponibles
#   apply <gdi> <l> <h> <hz>     -> {"ok":true} ou {"error":"..."}
#   test <gdi> <l> <h> <hz>      -> idem, sans rien changer (mode accepté par le pilote ?)
#   amdmode <gdi> <l> <h>        -> crée la résolution sur une carte AMD (ADLX) : {"ok":true},
#                                   {"unsupported":true} (autre carte, pilote ancien) ou {"error":"..."}
#   amdscale <gdi>               -> mise à l'échelle GPU plein écran sur une carte AMD :
#                                   {"ok":true,"changed":bool}, {"unsupported":true} ou {"error":"..."}
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
    delegate bool EnumWindowsProc(IntPtr hwnd, IntPtr lParam);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowsProc proc, IntPtr lParam);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr hwnd, out uint pid);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr hwnd);
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int Left, Top, Right, Bottom; }
    [DllImport("user32.dll")] static extern bool GetWindowRect(IntPtr hwnd, out RECT rect);
    // Tailles en pixels réels, comme les modes d'affichage, quelle que soit la mise à l'échelle Windows.
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
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
        HashSet<uint> gamePids = new HashSet<uint>();
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
                        if (names.Length > 0 && n == names[names.Length - 1]) gamePids.Add(pe.th32ProcessID);
                    } while (Process32NextW(snap, ref pe));
                }
            }
            finally { CloseHandle(snap); }
        }
        // La fenêtre du jeu se ferme ~15-20 s avant la fin du processus : elle sert à restaurer plus tôt.
        // Fenêtre visible du processus du jeu (dernier nom), ni par titre (« VALORANT  ») ni par classe
        // (« VALORANTUnrealWindow ») : ils varient selon les versions.
        IntPtr hwnd = IntPtr.Zero;
        if (gamePids.Count > 0) EnumWindows((h, l) =>
        {
            uint owner;
            GetWindowThreadProcessId(h, out owner);
            if (!IsWindowVisible(h) || !gamePids.Contains(owner)) return true;
            hwnd = h;
            return false;
        }, IntPtr.Zero);
        StringBuilder sb = new StringBuilder("{\"run\":[");
        for (int i = 0; i < run.Length; i++) sb.Append(i > 0 ? "," : "").Append(run[i] ? "true" : "false");
        sb.Append("],\"window\":").Append(hwnd != IntPtr.Zero ? "true" : "false");
        // Taille de la fenêtre (lecture seule) : plus grande que l'écran, le jeu n'a pas suivi la résolution.
        RECT r;
        if (hwnd != IntPtr.Zero && GetWindowRect(hwnd, out r)) sb.Append(",\"ww\":").Append(r.Right - r.Left).Append(",\"wh\":").Append(r.Bottom - r.Top);
        return sb.Append("}").ToString();
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
            sb.Append("{\"gdi\":").Append(Str(dd.DeviceName)).Append(",\"gpu\":").Append(Str(dd.DeviceString))
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

    // CDS_TEST d'abord : un mode refusé par le pilote n'est jamais appliqué (pas d'écran noir).
    // Sans CDS_UPDATEREGISTRY : changement dynamique, Windows revient au mode enregistré au redémarrage.
    static string ApplyOn(string gdi, int w, int h, int hz, bool testOnly)
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
        if (testOnly) return null;
        r = ChangeDisplaySettingsEx(gdi, ref dm, IntPtr.Zero, 0, IntPtr.Zero);
        if (r != 0) return "Échec du changement de résolution (code " + r + ").";
        return null;
    }

    public static string Apply(string gdi, int w, int h, int hz, bool testOnly)
    {
        string err = ApplyOn(gdi, w, h, hz, testOnly);
        // Secours : mode du bureau par défaut (écran principal).
        if (err != null && ApplyOn(null, w, h, hz, testOnly) == null) err = null;
        return err == null ? "{\"ok\":true}" : "{\"error\":" + Str(err) + "}";
    }

    // ---- Résolution personnalisée sur carte AMD (ADLX, fourni avec le pilote AMD) ----
    // Interfaces C d'ADLX : chaque objet commence par sa table de fonctions (ordre des en-têtes du SDK).
    [StructLayout(LayoutKind.Sequential)]
    struct ADLX_CustomResolution
    {
        public int resWidth, resHeight, refreshRate, presentation, timingStandard, GPixelClock; // horloge en kHz
        public int timingFlags, hTotal, vTotal, hDisplay, vDisplay, hFrontPorch, vFrontPorch, hSyncWidth, vSyncWidth, hPolarity, vPolarity;
    }
    [DllImport("kernel32.dll", CharSet = CharSet.Unicode)] static extern IntPtr LoadLibrary(string file);
    [DllImport("kernel32.dll", CharSet = CharSet.Ansi)] static extern IntPtr GetProcAddress(IntPtr module, string name);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] delegate int AdlxVersionFn(out ulong version);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)] delegate int AdlxInitFn(ulong version, out IntPtr system);
    delegate int GetPtrFn(IntPtr self, out IntPtr result);
    delegate int GetPtrForFn(IntPtr self, IntPtr arg, out IntPtr result);
    delegate uint SizeFn(IntPtr self);
    delegate int AtFn(IntPtr self, uint index, out IntPtr result);
    delegate int GetBoolFn(IntPtr self, [MarshalAs(UnmanagedType.U1)] out bool result); // adlx_bool : 1 octet
    delegate int SetBoolFn(IntPtr self, [MarshalAs(UnmanagedType.U1)] bool value);
    delegate int GetIntFn(IntPtr self, out int result);
    delegate int SetIntFn(IntPtr self, int value);
    delegate int GetResFn(IntPtr self, out ADLX_CustomResolution result);
    delegate int SetResFn(IntPtr self, ADLX_CustomResolution value);
    delegate int WithPtrFn(IntPtr self, IntPtr arg);
    delegate int ReleaseFn(IntPtr self);

    static T Vt<T>(IntPtr obj, int index) where T : class
    {
        return Marshal.GetDelegateForFunctionPointer(Marshal.ReadIntPtr(Marshal.ReadIntPtr(obj), index * IntPtr.Size), typeof(T)) as T;
    }
    static void Release(IntPtr obj) { if (obj != IntPtr.Zero) Vt<ReleaseFn>(obj, 1)(obj); }
    static void Ok(int r, string step) { if (r != 0) throw new Exception("Carte AMD : " + step + " impossible (code " + r + ")."); }

    // « AUS2405 » : fabricant et produit, tels que Windows les nomme (DISPLAY\AUS2405\...).
    static string MonitorModel(string gdi)
    {
        DISPLAY_DEVICE mon = new DISPLAY_DEVICE();
        mon.cb = Marshal.SizeOf(typeof(DISPLAY_DEVICE));
        if (!EnumDisplayDevices(gdi, 0, ref mon, EDD_GET_DEVICE_INTERFACE_NAME)) return null;
        string[] parts = (mon.DeviceID ?? "").Split('#');
        return parts.Length > 1 ? parts[1].ToUpperInvariant() : null;
    }
    // Même nom calculé depuis l'EDID (texte hexadécimal) : octets 8-9 fabricant, 10-11 produit.
    static string EdidModel(string edid)
    {
        if (edid == null || edid.Length < 24) return null;
        int m = Convert.ToInt32(edid.Substring(16, 4), 16);
        int product = Convert.ToInt32(edid.Substring(22, 2) + edid.Substring(20, 2), 16);
        string maker = "" + (char)('@' + ((m >> 10) & 31)) + (char)('@' + ((m >> 5) & 31)) + (char)('@' + (m & 31));
        return maker + product.ToString("X4");
    }

    // Nouvelle résolution reprise du mode actuel de l'écran : mêmes marges et synchronisation,
    // largeur et hauteur actives changées, horloge recalculée (même fréquence de balayage ligne).
    // ADLX initialisé une fois pour toute la vie de l'assistant : le réinitialiser après
    // ADLXTerminate dans le même processus fait planter le pilote.
    static IntPtr adlxSystem = IntPtr.Zero;
    static bool adlxTried = false;
    static IntPtr AdlxSystem()
    {
        if (adlxTried) return adlxSystem;
        adlxTried = true;
        IntPtr dll = LoadLibrary("amdadlx64.dll");
        if (dll == IntPtr.Zero) return IntPtr.Zero;
        IntPtr pVer = GetProcAddress(dll, "ADLXQueryFullVersion"), pInit = GetProcAddress(dll, "ADLXInitialize");
        if (pVer == IntPtr.Zero || pInit == IntPtr.Zero) return IntPtr.Zero;
        ulong version;
        IntPtr system;
        if (((AdlxVersionFn)Marshal.GetDelegateForFunctionPointer(pVer, typeof(AdlxVersionFn)))(out version) == 0
            && ((AdlxInitFn)Marshal.GetDelegateForFunctionPointer(pInit, typeof(AdlxInitFn)))(version, out system) == 0) adlxSystem = system;
        return adlxSystem;
    }

    // Écran du jeu dans la liste ADLX : seul écran AMD de ce modèle. Modèle illisible ou deux écrans
    // identiques : aucun (un réglage posé sur le mauvais écran ne servirait à rien).
    static int AmdTarget(string gdi, IntPtr list)
    {
        // Juste après une création, Windows réénumère les écrans : le modèle reste illisible un moment.
        string model = MonitorModel(gdi);
        for (int i = 0; model == null && i < 15; i++) { System.Threading.Thread.Sleep(200); model = MonitorModel(gdi); }
        uint count = Vt<SizeFn>(list, 3)(list);
        int target = -1, matches = 0;
        for (uint i = 0; i < count; i++)
        {
            IntPtr display = IntPtr.Zero;
            try
            {
                Ok(Vt<AtFn>(list, 11)(list, i, out display), "lecture de l'écran");
                IntPtr edid;
                Vt<GetPtrFn>(display, 7)(display, out edid);
                if (model == null ? count == 1 : EdidModel(Marshal.PtrToStringAnsi(edid)) == model) { target = (int)i; matches++; }
            }
            finally { Release(display); }
        }
        return matches == 1 ? target : -1;
    }

    // Mise à l'échelle GPU en plein écran : la carte agrandit l'image et l'écran reçoit toujours sa
    // résolution native. Sans elle, l'écran agrandit lui-même le signal 4:3 et beaucoup le rendent mal
    // (image figée, artefacts). Rien n'est touché si c'est déjà le cas.
    public static string AmdGpuScaling(string gdi)
    {
        IntPtr system = AdlxSystem();
        if (system == IntPtr.Zero) return "{\"unsupported\":true}";
        IntPtr services = IntPtr.Zero, list = IntPtr.Zero, display = IntPtr.Zero, scaling = IntPtr.Zero, mode = IntPtr.Zero;
        try
        {
            Ok(Vt<GetPtrFn>(system, 3)(system, out services), "liste des écrans");
            Ok(Vt<GetPtrFn>(services, 4)(services, out list), "liste des écrans");
            int target = AmdTarget(gdi, list);
            if (target < 0) return "{\"unsupported\":true}";
            Ok(Vt<AtFn>(list, 11)(list, (uint)target, out display), "lecture de l'écran");
            Ok(Vt<GetPtrForFn>(services, 11)(services, display, out scaling), "mise à l'échelle GPU");
            bool supported, enabled;
            if (Vt<GetBoolFn>(scaling, 3)(scaling, out supported) != 0 || !supported) return "{\"unsupported\":true}";
            bool changed = false;
            Ok(Vt<GetBoolFn>(scaling, 4)(scaling, out enabled), "mise à l'échelle GPU");
            if (!enabled) { Ok(Vt<SetBoolFn>(scaling, 5)(scaling, true), "activation de la mise à l'échelle GPU"); changed = true; }
            // Mode plein écran (1) : l'image 4:3 est étirée sur toute la dalle, sans bandes noires.
            if (Vt<GetPtrForFn>(services, 12)(services, display, out mode) == 0 && Vt<GetBoolFn>(mode, 3)(mode, out supported) == 0 && supported)
            {
                int current;
                Ok(Vt<GetIntFn>(mode, 4)(mode, out current), "mode de mise à l'échelle");
                if (current != 1) { Ok(Vt<SetIntFn>(mode, 5)(mode, 1), "mode de mise à l'échelle"); changed = true; }
            }
            return "{\"ok\":true,\"changed\":" + (changed ? "true" : "false") + "}";
        }
        catch (Exception e) { return "{\"error\":" + Str(e.Message) + "}"; }
        finally { Release(mode); Release(scaling); Release(display); Release(list); Release(services); }
    }

    public static string AmdCreateMode(string gdi, int w, int h)
    {
        IntPtr system = AdlxSystem();
        if (system == IntPtr.Zero) return "{\"unsupported\":true}";
        IntPtr services = IntPtr.Zero, list = IntPtr.Zero;
        try
        {
            Ok(Vt<GetPtrFn>(system, 3)(system, out services), "liste des écrans");
            Ok(Vt<GetPtrFn>(services, 4)(services, out list), "liste des écrans");
            int target = AmdTarget(gdi, list);
            if (target < 0) return "{\"unsupported\":true}";
            {
                IntPtr display = IntPtr.Zero, custom = IntPtr.Zero, current = IntPtr.Zero;
                try
                {
                    Ok(Vt<AtFn>(list, 11)(list, (uint)target, out display), "lecture de l'écran");
                    Ok(Vt<GetPtrForFn>(services, 18)(services, display, out custom), "résolutions personnalisées");
                    bool supported;
                    if (Vt<GetBoolFn>(custom, 3)(custom, out supported) != 0 || !supported) return "{\"unsupported\":true}";
                    Ok(Vt<GetPtrFn>(custom, 5)(custom, out current), "lecture du mode actuel");
                    ADLX_CustomResolution cr;
                    Ok(Vt<GetResFn>(current, 3)(current, out cr), "lecture du mode actuel");
                    int hBlank = cr.hTotal - cr.hDisplay, vBlank = cr.vTotal - cr.vDisplay;
                    cr.resWidth = cr.hDisplay = w;
                    cr.resHeight = cr.vDisplay = h;
                    cr.hTotal = (w + hBlank + 7) / 8 * 8; // multiple de 8, comme les timings CVT
                    cr.vTotal = h + vBlank;
                    cr.timingStandard = 4; // manuel : ces valeurs telles quelles
                    cr.GPixelClock = (int)Math.Round((double)cr.hTotal * cr.vTotal * cr.refreshRate / 10000.0) * 10;
                    Ok(Vt<SetResFn>(current, 4)(current, cr), "préparation du mode");
                    Ok(Vt<WithPtrFn>(custom, 6)(custom, current), "création de la résolution");
                    return "{\"ok\":true}";
                }
                finally { Release(current); Release(custom); Release(display); }
            }
        }
        catch (Exception e) { return "{\"error\":" + Str(e.Message) + "}"; }
        finally
        {
            Release(list);
            Release(services);
        }
    }
}
'@

[void][PgStretch]::SetProcessDPIAware()
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
[Console]::Out.WriteLine('{"ready":true}')
while ($null -ne ($line = [Console]::In.ReadLine())) {
  $a = $line.Trim().Split(' ')
  try {
    switch ($a[0]) {
      'procs' { $out = [PgStretch]::Procs([string[]]($a | Select-Object -Skip 1)) }
      'display' { $out = [PgStretch]::Display() }
      'apply' { $out = [PgStretch]::Apply($a[1], [int]$a[2], [int]$a[3], [int]$a[4], $false) }
      'amdmode' { $out = [PgStretch]::AmdCreateMode($a[1], [int]$a[2], [int]$a[3]) }
      'amdscale' { $out = [PgStretch]::AmdGpuScaling($a[1]) }
      'test' { $out = [PgStretch]::Apply($a[1], [int]$a[2], [int]$a[3], [int]$a[4], $true) }
      default { $out = '{"error":"Commande inconnue."}' }
    }
  } catch {
    $out = '{"error":"' + ($_.Exception.Message -replace '["\\]', ' ') + '"}'
  }
  [Console]::Out.WriteLine($out)
  [Console]::Out.Flush()
}
