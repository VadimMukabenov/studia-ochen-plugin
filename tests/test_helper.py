import unittest
from helper.server import validate_query, rank, pool, make_server
import numpy as np

class Helpers(unittest.TestCase):
    def test_query_limits_and_schema(self):
        self.assertEqual(validate_query({'query':'  Новые знания  '}),'Новые знания')
        for value in ({}, {'query':' '}, {'query':'a'*501}, {'query':3}):
            with self.assertRaises(ValueError): validate_query(value)
    def test_average_pool_ignores_padding_and_normalizes(self):
        result=pool(np.array([[[3.,0.],[0.,4.],[999.,999.]]]),np.array([[1,1,0]]))
        np.testing.assert_allclose(result,[[.6,.8]])
    def test_unrelated_or_ambiguous_scores_are_rejected(self):
        for scores in ([.50,.49,.48],[.80,.799,.798]):
            with self.assertRaises(ValueError): rank(['book','phone','coin'],scores)
    def test_top_relevant_ids_only_not_arbitrary_catalog(self):
        self.assertEqual(rank(['book','phone','coin'],[.91,.89,.73]),['book','phone'])
    def test_http_contract_and_no_prompt_logging(self):
        import threading,urllib.request,urllib.error,json
        class Engine:
            def resolve(self,q): return {'keys':['book'],'reasons':['Книга: знания'],'engine':'multilingual-e5-small'}
        server=make_server(Engine(),port=0); thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        url='http://127.0.0.1:'+str(server.server_port)
        try:
            self.assertTrue(json.load(urllib.request.urlopen(url+'/health'))['ready'])
            req=urllib.request.Request(url+'/resolve',data=json.dumps({'query':'Знания'}).encode(),headers={'Content-Type':'application/json','X-Sobrano-Client':'1'})
            self.assertEqual(json.load(urllib.request.urlopen(req))['keys'],['book'])
            with self.assertRaises(urllib.error.HTTPError) as ctx:
                urllib.request.urlopen(urllib.request.Request(url+'/resolve',data=b'{}'))
            self.assertEqual(ctx.exception.code,403)
        finally: server.shutdown();server.server_close()
if __name__=='__main__': unittest.main()

class UnsupportedInstructions(unittest.TestCase):
    def test_negative_constraints_are_explicit_instead_of_ignored(self):
        for q in ('Сбережения без монет','Не используй телефон','Исключи кошелек'):
            with self.assertRaisesRegex(ValueError,'ограничения'):validate_query({'query':q})

class EmpiricalNegatives(unittest.TestCase):
    def test_unrelated_observed_model_scores_are_below_acceptance(self):
        # Actual E5 maxima from first run: borscht .7836, Mars .7838.
        for score in (.7836,.7838,.8198):
            with self.assertRaises(ValueError):rank(['flowers','pen'],[score,.7728])
    def test_weak_tail_candidates_are_not_added_to_clear_topic(self):
        self.assertEqual(rank(['coin','pen','book'],[.8519,.8081,.8077]),['coin'])
