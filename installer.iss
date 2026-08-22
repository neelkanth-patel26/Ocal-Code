; ============================================================
;  Ocal Code Studio - Inno Setup 6 Premium Installer
;  Version  : 1.0.0 (Stable)
;  Publisher: Gaming Network Studio Media Group
;  Author   : Neelkanth Patel
;  Compiler : Inno Setup 6
; ============================================================

[Setup]
AppName=Ocal Code
AppVersion=1.0.0
AppVerName=Ocal Code 1.0.0
AppPublisher=Gaming Network Studio Media Group
AppPublisherURL=https://github.com/neelkanth-patel26/Ocal-Code
AppSupportURL=https://github.com/neelkanth-patel26/Ocal-Code/issues
AppUpdatesURL=https://github.com/neelkanth-patel26/Ocal-Code/releases
AppCopyright=Copyright (C) 2026 Gaming Network Studio Media Group
DefaultDirName={autopf}\Ocal Code
DefaultGroupName=Ocal Code
OutputDir=dist-inno
OutputBaseFilename=Ocal-Code-1.0.0-Setup
SetupIconFile=icon.ico
Compression=lzma2/ultra64
SolidCompression=yes
DiskSpanning=no
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
LicenseFile=license.txt
MinVersion=10.0.17763
UninstallDisplayIcon={app}\icon.ico
UninstallDisplayName=Ocal Code Studio 1.0.0
VersionInfoVersion=1.0.0.0
VersionInfoCompany=Gaming Network Studio Media Group
VersionInfoDescription=Ocal Code Studio Installer
VersionInfoProductName=Ocal Code
VersionInfoProductVersion=1.0.0
WizardStyle=modern
WizardResizable=no
ShowLanguageDialog=no
CloseApplications=yes
CloseApplicationsFilter=Ocal Code.exe

; Components Selection
[Types]
Name: "full";    Description: "Full Installation (Recommended with C/C++ Toolchain)"
Name: "compact"; Description: "Compact Installation (Core Editor only)"
Name: "custom";  Description: "Custom Installation"; Flags: iscustom

[Components]
Name: "core";        Description: "Ocal Code Core Editor & Terminal Engine"; Types: full compact custom; Flags: fixed
Name: "contextmenu"; Description: "Windows Explorer 'Open with Ocal Code' Context Menu"; Types: full custom
Name: "compiler";    Description: "Bundled Offline GCC/MinGW-w64 C/C++ Toolchain"; Types: full custom

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "quicklaunch"; Description: "Pin to Taskbar / Start Menu"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "addtopath";   Description: "Add Ocal Code to System PATH"; GroupDescription: "System Integration"; Flags: checkedonce

[CustomMessages]
InstallingCore=Installing Ocal Code Studio core files...
InstallingCompiler=Deploying bundled GCC C/C++ toolchain...
LaunchAfterInstall=Launch Ocal Code now
ReleaseNotes=View release notes & documentation on GitHub

; Files to install
[Files]
; Core executable and unpacked Electron app
Source: "release\win-unpacked\Ocal Code.exe"; DestDir: "{app}"; Flags: ignoreversion; Components: core
Source: "release\win-unpacked\*"; DestDir: "{app}"; Excludes: "Ocal Code.exe,LICENSE.electron.txt,LICENSES.chromium.html"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: core

; Icons and EULA
Source: "icon.ico"; DestDir: "{app}"; Flags: ignoreversion; Components: core
Source: "license.txt"; DestDir: "{app}"; Flags: ignoreversion; Components: core

; Bundled portable compiler (if exists)
Source: "compiler\*"; DestDir: "{app}\resources\compiler"; Flags: ignoreversion recursesubdirs createallsubdirs; Components: compiler; Check: DirExists(ExpandConstant('{src}\compiler'))

; Shortcuts
[Icons]
Name: "{autoprograms}\Ocal Code"; Filename: "{app}\Ocal Code.exe"; IconFilename: "{app}\icon.ico"; AppUserModelID: "com.gamingnetwork.ocalcode"
Name: "{group}\Uninstall Ocal Code"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Ocal Code"; Filename: "{app}\Ocal Code.exe"; Tasks: desktopicon; IconFilename: "{app}\icon.ico"; AppUserModelID: "com.gamingnetwork.ocalcode"

; Windows Registry Integration & Context Menu
[Registry]
; Context Menu: "Open with Ocal Code" on Files
Root: HKCR; Subkey: "*\shell\OcalCode"; ValueType: string; ValueName: ""; ValueData: "Open with Ocal Code"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "*\shell\OcalCode"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\Ocal Code.exe"",0"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "*\shell\OcalCode\command"; ValueType: string; ValueName: ""; ValueData: """{app}\Ocal Code.exe"" ""%1"""; Flags: uninsdeletekey; Components: contextmenu

; Context Menu: "Open with Ocal Code" on Folders & Backgrounds
Root: HKCR; Subkey: "Directory\shell\OcalCode"; ValueType: string; ValueName: ""; ValueData: "Open with Ocal Code"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "Directory\shell\OcalCode"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\Ocal Code.exe"",0"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "Directory\shell\OcalCode\command"; ValueType: string; ValueName: ""; ValueData: """{app}\Ocal Code.exe"" ""%1"""; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "Directory\Background\shell\OcalCode"; ValueType: string; ValueName: ""; ValueData: "Open with Ocal Code"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "Directory\Background\shell\OcalCode"; ValueType: string; ValueName: "Icon"; ValueData: """{app}\Ocal Code.exe"",0"; Flags: uninsdeletekey; Components: contextmenu
Root: HKCR; Subkey: "Directory\Background\shell\OcalCode\command"; ValueType: string; ValueName: ""; ValueData: """{app}\Ocal Code.exe"" ""%V"""; Flags: uninsdeletekey; Components: contextmenu

; App Registration in Windows Add/Remove Programs
Root: HKLM; Subkey: "Software\OcalCode"; ValueType: string; ValueName: "Version"; ValueData: "1.0.0"; Flags: uninsdeletekey
Root: HKLM; Subkey: "Software\OcalCode"; ValueType: string; ValueName: "InstallPath"; ValueData: "{app}"; Flags: uninsdeletekey

; Post-Install Run
[Run]
Filename: "{app}\Ocal Code.exe"; Description: "{cm:LaunchAfterInstall}"; Flags: nowait postinstall skipifsilent
Filename: "https://github.com/neelkanth-patel26/Ocal-Code"; Description: "{cm:ReleaseNotes}"; Flags: shellexec postinstall skipifsilent unchecked

[Code]
function DirExists(DirName: string): Boolean;
begin
  Result := DirExists(DirName);
end;
