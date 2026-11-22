import json, os, threading, unittest, urllib.request, urllib.error
from unittest.mock import patch
from helper.planner import constraints, Planner, PlannerError, decode_cloud, embedding_choice
from helper.server import make_server

class Stub:
    def __init__(self, keys=('lamp','pen')): self.keys=list(keys);self.seen=[]
    def resolve(self,q): self.seen.append(q);return {'keys':self.keys,'engine':'multilingual-e5-small','scores':{'lamp':.9}}
class PlannerTests(unittest.TestCase):
    def setUp(self):
        clean=patch.dict(os.environ,{'OPENROUTER_API_KEY':''});clean.start();self.addCleanup(clean.stop)
    def test_explicit_objects_and_exclusion_scope(self):
        for q,wanted in [('Книга и кошелёк без телефона',['book','wallet']),('Без телефона, но с книгой и лампой',['book','lamp']),('Не добавляй кошелёк. Хочу книгу и ручку',['book','pen']),('Книга без телефона и с ручкой',['book','pen']),('Учеба без телефона, с книгой',['book']),('Не телефон, а книга',['book'])]:
            result=Planner(Stub()).resolve(q,'local');self.assertEqual(set(result['keys']),set(wanted))
        with self.assertRaises(PlannerError):Planner(Stub()).resolve('Не используй телефон','local')
    def test_negative_names_never_reach_embedding_or_result(self):
        e=Stub(('book','coin'));r=Planner(e).resolve('Самообразование без монет','local')
        self.assertEqual(r['keys'],['book']);self.assertNotIn('монет',e.seen[0]);self.assertIn('coin',r['excluded'])
    def test_close_theme_does_not_override_clear_native_family(self):
        scores=[.75]*19;scores[2]=.8514;scores[14]=.8574
        best,uncertain=embedding_choice(scores)
        self.assertEqual(best,2);self.assertTrue(uncertain)
        import numpy as np
        json.dumps(embedding_choice(np.array([.9]+[.75]*18)))
    def test_excluded_objects_are_not_recommended_in_explanation(self):
        class E:
            def resolve(self,q):return {'keys':['wallet','coin'],'reason':'Кошелёк и монета','engine':'multilingual-e5-small'}
        r=Planner(E()).resolve('Сбережения без монет','local')
        self.assertEqual(r['keys'],['wallet']);self.assertIn('Исключено',r['reason'])
    def test_cloud_has_strict_allowlist_and_no_empty_or_unknown_objects(self):
        for payload in ('{}','{"keys":["car"]}','{"keys":[]}','{"keys":["phone","phone"]}', '{"keys":["book"],"reason":"<script>x</script>"}'):
            with self.assertRaises(PlannerError):decode_cloud(payload)
        self.assertEqual(decode_cloud('{"keys":["book","pen"],"reason":"Учёба"}')['keys'],['book','pen'])
    def test_no_silent_engine_fallback_and_rules_are_labelled(self):
        p=Planner(None)
        self.assertEqual(p.resolve('Найти общий язык','rules')['engine'],'rules')
        for q,e in [('Новые знания','local'),('Знания','openrouter'),('Знания','paid')]:
            with self.assertRaises(PlannerError):p.resolve(q,e)
        with self.assertRaises(PlannerError):p.resolve('Нужны ракета и автомобиль','rules')
    def test_http_editor_static_and_engines(self):
        server=make_server(Stub(),port=0);thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        base='http://127.0.0.1:'+str(server.server_port)
        try:
            for path in ('/','/app.mjs','/core.mjs','/catalog.mjs','/assets/phone-L-main.svg','/icons/copy.svg'):
                with urllib.request.urlopen(base+path) as r:self.assertEqual(r.status,200)
            for path in ('/.env','/source/originals/library-L.svg','/../helper/server.py','/%2e%2e/helper/server.py'):
                with self.assertRaises(urllib.error.HTTPError):urllib.request.urlopen(base+path)
            req=urllib.request.Request(base+'/resolve',data=json.dumps({'query':'Телефон и пазлы','engine':'local'}).encode(),headers={'Content-Type':'application/json','X-Sobrano-Client':'1'})
            self.assertEqual(json.load(urllib.request.urlopen(req))['keys'],['phone','puzzle'])
            self.assertFalse(json.load(urllib.request.urlopen(base+'/health'))['openrouter'])
        finally:server.shutdown();server.server_close()
if __name__=='__main__':unittest.main()
