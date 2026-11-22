import os, pathlib, subprocess, tempfile, unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class ReleaseSafetyTests(unittest.TestCase):
    def invoke(self, state,version="v0.2.0-preview"):
        with tempfile.TemporaryDirectory() as folder:
            folder = pathlib.Path(folder)
            gh = folder/'gh'
            gh.write_text('''#!/bin/sh
echo "$*" >> "$CALL_LOG"
if [ "$2" = view ]; then
  case "$RELEASE_STATE" in published) echo false;; draft) echo true;; missing) exit 1;; esac
fi
''')
            gh.chmod(0o755)
            env = {**os.environ, 'PATH':str(folder)+os.pathsep+os.environ['PATH'],
                'CALL_LOG':str(folder/'calls'), 'RELEASE_STATE':state, 'GITHUB_SHA':'new-commit'}
            result = subprocess.run(['sh',str(ROOT/'scripts/prepare-reviewer-release.sh'),version],
                env=env,capture_output=True,text=True)
            calls = (folder/'calls').read_text() if (folder/'calls').exists() else ''
            return result, calls

    def test_published_release_is_immutable(self):
        result, calls = self.invoke('published')
        self.assertNotEqual(result.returncode,0)
        self.assertIn('already published',result.stderr)
        self.assertNotIn('release edit',calls)
        self.assertNotIn('release create',calls)

    def test_existing_draft_tracks_the_built_source(self):
        result,calls = self.invoke('draft')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('release edit v0.2.0-preview --target new-commit',calls)

    def test_new_release_starts_as_draft(self):
        result,calls = self.invoke('missing')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('release create v0.2.0-preview --draft --prerelease --target new-commit',calls)

    def test_stable_release_starts_as_draft_without_prerelease(self):
        result,calls=self.invoke('missing','v0.3.0')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertIn('release create v0.3.0 --draft --target new-commit',calls)
        self.assertNotIn('--prerelease',calls)

if __name__=='__main__': unittest.main()
