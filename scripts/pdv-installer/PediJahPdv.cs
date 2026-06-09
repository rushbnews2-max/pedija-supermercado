using System;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;

[assembly: AssemblyTitle("PediJah PDV")]
[assembly: AssemblyDescription("Impressao automatica e acesso ao painel PediJah")]
[assembly: AssemblyCompany("PediJah")]
[assembly: AssemblyProduct("PediJah PDV")]
[assembly: AssemblyVersion("1.0.2.0")]
[assembly: AssemblyFileVersion("1.0.2.0")]

namespace PediJahPdv
{
    internal static class Program
    {
        private const string ProductName = "PediJah PDV";
        private static readonly string InstallDir = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            ProductName
        );
        private static readonly string InstalledExe = Path.Combine(InstallDir, ProductName + ".exe");
        private static readonly string ConfigFile = Path.Combine(InstallDir, "estabelecimento.txt");
        private static readonly string ProfileDir = Path.Combine(InstallDir, "Perfil");

        [STAThread]
        private static void Main(string[] args)
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            bool configure = Array.Exists(args, value => value.Equals("--configurar", StringComparison.OrdinalIgnoreCase));
            bool installedCopy = PathsEqual(Application.ExecutablePath, InstalledExe);

            if (installedCopy && File.Exists(ConfigFile) && !configure)
            {
                LaunchPanel(File.ReadAllText(ConfigFile).Trim());
                return;
            }

            Application.Run(new InstallerForm(installedCopy));
        }

        private static bool PathsEqual(string left, string right)
        {
            return string.Equals(Path.GetFullPath(left), Path.GetFullPath(right), StringComparison.OrdinalIgnoreCase);
        }

        internal static string SuggestedUrl()
        {
            try
            {
                string clipboard = Clipboard.GetText().Trim();
                if (IsValidAdminUrl(clipboard)) return clipboard;
            }
            catch { }

            if (File.Exists(ConfigFile))
            {
                string saved = File.ReadAllText(ConfigFile).Trim();
                if (IsValidAdminUrl(saved)) return saved;
            }

            return "https://pedijah.com.br/admin/";
        }

        internal static bool IsValidAdminUrl(string value)
        {
            Uri uri;
            return Uri.TryCreate(value, UriKind.Absolute, out uri)
                && (uri.Scheme == Uri.UriSchemeHttps || uri.IsLoopback)
                && uri.AbsolutePath.TrimEnd('/').StartsWith("/admin", StringComparison.OrdinalIgnoreCase);
        }

        internal static void Install(string url, bool startWithWindows)
        {
            Directory.CreateDirectory(InstallDir);
            Directory.CreateDirectory(ProfileDir);

            if (!PathsEqual(Application.ExecutablePath, InstalledExe))
            {
                File.Copy(Application.ExecutablePath, InstalledExe, true);
            }

            File.WriteAllText(ConfigFile, url.Trim());
            CreateShortcut(
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.DesktopDirectory), ProductName + ".lnk"),
                InstalledExe,
                "",
                "Abrir painel PediJah com impressao automatica"
            );
            CreateShortcut(
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Programs), "Configurar " + ProductName + ".lnk"),
                InstalledExe,
                "--configurar",
                "Alterar estabelecimento do PediJah PDV"
            );

            string startupShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Startup), ProductName + ".lnk");
            if (startWithWindows)
            {
                CreateShortcut(startupShortcut, InstalledExe, "", "Iniciar PediJah PDV com o Windows");
            }
            else if (File.Exists(startupShortcut))
            {
                File.Delete(startupShortcut);
            }

            RefreshWindowsIcons();
        }

        private static void CreateShortcut(string path, string target, string arguments, string description)
        {
            Type shellType = Type.GetTypeFromProgID("WScript.Shell");
            dynamic shell = Activator.CreateInstance(shellType);
            dynamic shortcut = shell.CreateShortcut(path);
            shortcut.TargetPath = target;
            shortcut.Arguments = arguments;
            shortcut.WorkingDirectory = InstallDir;
            shortcut.IconLocation = target + ",0";
            shortcut.Description = description;
            shortcut.WindowStyle = 1;
            shortcut.Save();
        }

        private static void RefreshWindowsIcons()
        {
            string refreshTool = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), "System32", "ie4uinit.exe");
            if (!File.Exists(refreshTool)) return;

            try
            {
                Process.Start(new ProcessStartInfo(refreshTool, "-show") {
                    UseShellExecute = false,
                    CreateNoWindow = true
                });
            }
            catch { }
        }

        internal static void LaunchInstalled()
        {
            Process.Start(new ProcessStartInfo(InstalledExe) { UseShellExecute = true });
        }

        private static void LaunchPanel(string url)
        {
            string browser = FindBrowser();
            if (string.IsNullOrEmpty(browser))
            {
                MessageBox.Show(
                    "Instale o Google Chrome ou o Microsoft Edge para usar a impressao automatica.",
                    ProductName,
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning
                );
                return;
            }

            Directory.CreateDirectory(ProfileDir);
            string arguments = "--kiosk-printing --no-first-run --disable-session-crashed-bubble "
                + "--user-data-dir=\"" + ProfileDir + "\" --app=\"" + url + "\"";
            Process.Start(new ProcessStartInfo(browser, arguments) { UseShellExecute = true });
        }

        private static string FindBrowser()
        {
            string[] candidates = {
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Google", "Chrome", "Application", "chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Google", "Chrome", "Application", "chrome.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles), "Microsoft", "Edge", "Application", "msedge.exe"),
                Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86), "Microsoft", "Edge", "Application", "msedge.exe")
            };

            foreach (string candidate in candidates)
            {
                if (File.Exists(candidate)) return candidate;
            }

            return "";
        }
    }

    internal sealed class InstallerForm : Form
    {
        private readonly TextBox urlInput;
        private readonly CheckBox startupCheck;
        private readonly Label status;
        private readonly Button installButton;

        internal InstallerForm(bool installedCopy)
        {
            Text = installedCopy ? "Configurar PediJah PDV" : "Instalar PediJah PDV";
            Icon = Icon.ExtractAssociatedIcon(Application.ExecutablePath);
            ClientSize = new Size(610, 430);
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            StartPosition = FormStartPosition.CenterScreen;
            BackColor = Color.FromArgb(247, 249, 252);
            Font = new Font("Segoe UI", 9F);

            Panel brand = new Panel {
                Dock = DockStyle.Top,
                Height = 100,
                BackColor = Color.FromArgb(10, 26, 48)
            };
            Controls.Add(brand);

            Label mark = new Label {
                Text = "PediJah",
                ForeColor = Color.White,
                BackColor = Color.FromArgb(244, 81, 6),
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                TextAlign = ContentAlignment.MiddleCenter,
                Location = new Point(28, 22),
                Size = new Size(64, 56)
            };
            Label title = new Label {
                Text = "PediJah PDV",
                ForeColor = Color.White,
                Font = new Font("Segoe UI", 20F, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(108, 21)
            };
            Label subtitle = new Label {
                Text = "Impressao automatica de pedidos",
                ForeColor = Color.FromArgb(194, 205, 221),
                AutoSize = true,
                Location = new Point(111, 60)
            };
            brand.Controls.Add(mark);
            brand.Controls.Add(title);
            brand.Controls.Add(subtitle);

            Label heading = new Label {
                Text = installedCopy ? "Alterar estabelecimento" : "Conectar este computador",
                ForeColor = Color.FromArgb(10, 26, 48),
                Font = new Font("Segoe UI", 14F, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(28, 126)
            };
            Controls.Add(heading);

            Label instruction = new Label {
                Text = "Confira o link administrativo do estabelecimento que usara este caixa.",
                ForeColor = Color.FromArgb(83, 99, 122),
                AutoSize = true,
                Location = new Point(30, 161)
            };
            Controls.Add(instruction);

            Label urlLabel = new Label {
                Text = "Link do estabelecimento",
                Font = new Font("Segoe UI", 9F, FontStyle.Bold),
                AutoSize = true,
                Location = new Point(30, 201)
            };
            Controls.Add(urlLabel);

            urlInput = new TextBox {
                Text = Program.SuggestedUrl(),
                Location = new Point(30, 224),
                Size = new Size(548, 27),
                Font = new Font("Segoe UI", 10F)
            };
            Controls.Add(urlInput);

            startupCheck = new CheckBox {
                Text = "Abrir automaticamente ao iniciar o Windows",
                Checked = true,
                AutoSize = true,
                Location = new Point(30, 272)
            };
            Controls.Add(startupCheck);

            Label hint = new Label {
                Text = "Use a impressora termica como impressora padrao do Windows.",
                ForeColor = Color.FromArgb(100, 116, 139),
                AutoSize = true,
                Location = new Point(30, 302)
            };
            Controls.Add(hint);

            installButton = new Button {
                Text = installedCopy ? "Salvar configuracao" : "Instalar PediJah PDV",
                BackColor = Color.FromArgb(244, 81, 6),
                ForeColor = Color.White,
                FlatStyle = FlatStyle.Flat,
                Font = new Font("Segoe UI", 10F, FontStyle.Bold),
                Location = new Point(30, 340),
                Size = new Size(220, 44),
                Cursor = Cursors.Hand
            };
            installButton.FlatAppearance.BorderSize = 0;
            installButton.Click += InstallClick;
            Controls.Add(installButton);

            Button closeButton = new Button {
                Text = "Fechar",
                FlatStyle = FlatStyle.Flat,
                Location = new Point(264, 340),
                Size = new Size(100, 44),
                Cursor = Cursors.Hand
            };
            closeButton.Click += delegate { Close(); };
            Controls.Add(closeButton);

            status = new Label {
                ForeColor = Color.FromArgb(15, 122, 67),
                AutoSize = false,
                Location = new Point(30, 394),
                Size = new Size(548, 25)
            };
            Controls.Add(status);
        }

        private void InstallClick(object sender, EventArgs e)
        {
            string url = urlInput.Text.Trim().TrimEnd('/');
            if (!Program.IsValidAdminUrl(url) || url.EndsWith("/admin", StringComparison.OrdinalIgnoreCase))
            {
                status.ForeColor = Color.FromArgb(185, 28, 28);
                status.Text = "Informe o link completo, por exemplo: https://pedijah.com.br/admin/minha-loja";
                return;
            }

            try
            {
                installButton.Enabled = false;
                Program.Install(url, startupCheck.Checked);
                status.ForeColor = Color.FromArgb(15, 122, 67);
                status.Text = "Instalacao concluida. O atalho PediJah PDV foi criado.";
                DialogResult result = MessageBox.Show(
                    "PediJah PDV instalado com sucesso.\n\nDeseja abrir o caixa agora?",
                    "PediJah PDV",
                    MessageBoxButtons.YesNo,
                    MessageBoxIcon.Information
                );
                if (result == DialogResult.Yes) Program.LaunchInstalled();
                Close();
            }
            catch (Exception error)
            {
                installButton.Enabled = true;
                status.ForeColor = Color.FromArgb(185, 28, 28);
                status.Text = "Nao foi possivel instalar: " + error.Message;
            }
        }
    }
}
