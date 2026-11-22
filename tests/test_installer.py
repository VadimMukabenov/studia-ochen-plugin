"""Release contract: a portable archive with no developer environment required."""
import json, os, pathlib, subprocess, tempfile, unittest, zipfile

ROOT = pathlib.Path(__file__).resolve().parents[1]

class InstallerTests(unittest.TestCase):
    def test_archive_is_self_contained_and_shell_is_executable(self):
        with tempfile.TemporaryDirectory(prefix='sobrano package ') as folder:
            folder = pathlib.Path(folder)
            image = folder / 'image.tar.gz'
            image.write_bytes(b'fake image for packaging contract')
            result = subprocess.run(['python3', str(ROOT/'scripts/package-reviewer.py'),
                '--image', str(image), '--tag', 'sobrano-review:contract-test',
                '--arch', 'amd64', '--output', str(folder)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)
            archive = folder/'sobrano-amd64.zip'
            with zipfile.ZipFile(archive) as z:
                names = set(z.namelist())
                expected = {'START.cmd','START.command','STOP.cmd','STOP.command',
                    'compose.yaml','README.txt','image.tar.gz','plugin/manifest.json',
                    'plugin/code.js','plugin/ui.html'}
                self.assertEqual(names, {'sobrano/'+n for n in expected})
                manifest = json.loads(z.read('sobrano/plugin/manifest.json'))
                self.assertIn('sobrano/plugin/'+manifest['main'], names)
                self.assertIn('sobrano/plugin/'+manifest['ui'], names)
                self.assertIn(b'image: sobrano-review:contract-test', z.read('sobrano/compose.yaml'))
                self.assertNotIn(b'build:', z.read('sobrano/compose.yaml'))
                readme=z.read('sobrano/README.txt').decode()
                self.assertIn('Редактор уже открыт в браузере',readme)
                self.assertNotIn('Import plugin from manifest',readme)
                self.assertTrue(z.getinfo('sobrano/START.command').external_attr >> 16 & 0o100)
                self.assertEqual(z.read('sobrano/image.tar.gz'), image.read_bytes())
            import hashlib
            with archive.open('rb') as stream: digest = hashlib.file_digest(stream, 'sha256').hexdigest()
            self.assertEqual((folder/'sobrano-amd64.zip.sha256').read_text().split()[0], digest)

if __name__ == '__main__': unittest.main()
