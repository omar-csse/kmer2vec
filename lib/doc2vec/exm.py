import os
import json
import sys
import random
import math
import logging
import shutil
import time
from datetime import datetime

import multiprocessing

from gensim.models.doc2vec import Doc2Vec, TaggedDocument
from gensim.test.utils import common_texts
from nltk.tokenize import word_tokenize
import numpy as np
import nltk

nltk.download('punkt')

_dir_path = os.path.dirname(os.path.realpath(__file__))

# the collected data and labels
corpus = json.load(open(_dir_path + '/../data/corpus.json'))
sigma70 = json.load(open(_dir_path + '/../data/sigma70.json'))

data1 = [['i', 'love', 'machine', 'learning', '.', 'its', 'awesome', '.'],
        ['i', 'love', 'coding', 'in', 'python'],
        ['i', 'love', 'building', 'chatbots'],
        ['they', 'chat', 'amagingly', 'well']]


tagged_data = [TaggedDocument(words=seq, tags=[sigma70[i]['PROMOTER_ID']]) for i, seq in enumerate(corpus)]
documents = [TaggedDocument(doc, [i]) for i, doc in enumerate(common_texts)]
model = Doc2Vec(tagged_data, dm=1, vector_size=5, window=2, min_count=1)

print("\n\n")