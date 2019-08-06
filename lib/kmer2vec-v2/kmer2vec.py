import os
import json
import sys
import random
import math
import logging
import shutil
import collections
from array import array
import time
from datetime import datetime

import multiprocessing

import gensim
from gensim.models import Word2Vec, KeyedVectors
from gensim.models.callbacks import CallbackAny2Vec
from sklearn.manifold import TSNE
import numpy as np
np.set_printoptions(threshold=sys.maxsize)


class callback(CallbackAny2Vec):
    '''Callback to print loss after each epoch.'''

    def __init__(self):
        self.epoch = 0

    def on_epoch_end(self, model):
        loss = model.get_latest_training_loss()
        print('Loss after epoch {}: {}'.format(self.epoch, loss))
        self.epoch += 1


class Kmer2vec(object):

    """kmer2vec model (skipgram)."""


    def __init__(self, embedding_size=256, learningRate=0.025, window_size=8):

        self._corpus = []
        self._kmer2int = {}
        self._int2kmer = {}
        self._kmers_size = 0
        self._embedding_size = embedding_size
        self._learningRate = learningRate
        self._window_size = window_size
        self._log_file = None
        self._workers = multiprocessing.cpu_count()
        self._dir_path = os.path.dirname(os.path.realpath(__file__))
        self._model = None


    def _cleanDirectories(self, clean_logs=False):

        if os.path.exists(self._dir_path + '/log.txt'):
            os.remove(self._dir_path + '/log.txt')

        if (clean_logs):
            shutil.rmtree(self._dir_path + '/logs', ignore_errors=True)

    
    def openLogs(self):

        self._cleanDirectories()

        now = datetime.now()

        version = now.strftime("%m %d %Y-%H:%M:%S")
        self._logs_path = self._dir_path+'/logs/lr'+str(self._learningRate)+'-ws:'+str(self._window_size)+'-kmer2vec '+version
        os.makedirs(self._logs_path)

        self._log_file = open(self._logs_path + '/log.txt', 'a')
        return self._log_file


    def closeLogs(self):
        self._log_file.close()


    def setup(self):

        self._log_file.write("""kmer2vec model (skipgram).""")
        self._log_file.write("\n\nimplementing word2vec algorithm on promotors' sequences \nwith sigma70 factor using skip gram model\n\n")
        self._log_file.write("Hyper-parameters:\n\nembedding_size: {}, learning_rate: {}, window_size: {}".format(self._embedding_size, self._learningRate, self._window_size))

        # the collected data and labels
        self._corpus = json.load(open(self._dir_path + '/../data/corpus.json'))
        self._kmer2int = json.load(open(self._dir_path + '/../data/kmer2int.json'))
        self._int2kmer = json.load(open(self._dir_path + '/../data/int2kmer.json'))
        self._kmers_size = len(self._kmer2int)

        print("\nML Data setup is done\n")
        self._log_file.write("\n\nML Data setup is done\n")


    def build_model(self, epochs):
        self._model = Word2Vec( size=self._embedding_size, window=self._window_size, 
                                workers=self._workers, sg=1, alpha=self._learningRate,
                                seed=1, iter=epochs, min_count=0)
        
        self._model.build_vocab(self._corpus)


    def calc_loss(self):
        print(self._model.get_latest_training_loss())


    def train(self):
        self._model.train(  self._corpus, total_examples=self._model.corpus_count, 
                            epochs=self._model.epochs, compute_loss=True)


    def save(self):

        self._model.save(self._logs_path + "/kmer2vec.model")
        self._model.wv.save_word2vec_format(self._logs_path + '/kmer2vec.bin', binary=True)

        self._model = Word2Vec.load(self._logs_path + "/kmer2vec.model")
        similar = self._model.most_similar('TGGAAA')

        self._log_file.write("\n\n\nsimilar_words(TGGAAA)\n\n")
        self._log_file.write(str(similar))

        self._log_file.write("\n\n")
        print('\n\n')

        vectors = dict()
        vectors['vectors'] = {}
            
        for i, kmer in enumerate(self._kmer2int):
            kmer = str(kmer)
            vectors['vectors'].update( {kmer: self._model.wv[kmer].tolist()} )
            
        with open(self._dir_path+'/../data/kmer_vectors.json', 'w') as filename: json.dump(vectors, filename, indent=4)


def main():

    kmer2vec = Kmer2vec(embedding_size=256, learningRate=0.025, window_size=8)

    logs_file = kmer2vec.openLogs()

    kmer2vec.setup()
    kmer2vec.build_model(epochs=50)
    kmer2vec.train()
    kmer2vec.save()

    print("\n\n\nnumber of cpus: {}".format(multiprocessing.cpu_count()))
    logs_file.write("\n\n\nnumber of cpus: {}".format(multiprocessing.cpu_count()))

    print('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)
    logs_file.write('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)

    print('length of data: %d\n' % len(kmer2vec._model.wv.vocab))
    logs_file.write('length of data: %d' % len(kmer2vec._model.wv.vocab))

    print('\n\ntraining is done!, and model is saved.\n')
    logs_file.write('\n\ntraining is done!, and model is saved.\n')
    
    kmer2vec.closeLogs()


if __name__ == "__main__":
    main()