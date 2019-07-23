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

import multiprocessing as mp
from multiprocessing import Queue, Manager, Pool, Lock, Array

import tensorflow as tf
from tensorflow.contrib.tensorboard.plugins import projector

from sklearn.manifold import TSNE
import numpy as np
np.set_printoptions(threshold=sys.maxsize)


class Kmer2vec(object):

    """kmer2vec model (skipgram)."""


    def __init__(self, embedding_size, batch_size, learningRate, window_size):

        self._inputs = []
        self._labels = []
        self._average = 0.0
        self._data = []
        self._kmer2int = {}
        self._int2kmer = {}
        self._kmers_size = 0
        self._embedding_size = embedding_size
        self._batch_size = batch_size
        self._num_sampled = 8
        self._learningRate = learningRate
        self._window_size = window_size
        self._average_loss = 0.0
        self._data_index = 0
        self._graph = None
        self._train_inputs = None
        self._train_labels = None
        self._embeddings = None
        self._optimizer = None
        self._merged = None
        self._loss = None
        self._log_file = None
        self.__valid_size = 16  # Random set of words to evaluate similarity on.
        self.__valid_window = 100  # Only pick dev samples in the head of the distribution.
        self._valid_examples = np.random.choice(self.__valid_window, self.__valid_size, replace=False)
        self._similarity = None
        self._normalized_embeddings = None
        self._final_embeddings = None
        self._logs_path = None
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


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
        
        # restrict the logging information to errors only. Tensorflow shows many warinings
        # for the newr versions of used functions
        logging.getLogger("tensorflow").setLevel(logging.ERROR)

        self._log_file.write("""kmer2vec model (skipgram).""")
        self._log_file.write("\n\nimplementing word2vec algorithm on promotors' sequences \nwith sigma70 factor using skip gram model\n\n")
        self._log_file.write("Hyper-parameters:\n\nbatch_size: {}, embedding_size: {}, learning_rate: {}, window_size: {}".format(self._batch_size, self._embedding_size, self._learningRate, self._window_size))

        # the collected data and labels
        self._data = json.load(open(self._dir_path + '/../data/data.json'))
        self._kmer2int = json.load(open(self._dir_path + '/../data/kmer2int.json'))
        self._int2kmer = json.load(open(self._dir_path + '/../data/int2kmer.json'))
        self._kmers_size = len(self._kmer2int)

        print("\nML Data setup is done\n")
        self._log_file.write("\n\nML Data setup is done\n")


    def train(self, epochs):
        data = gensim.models.word2vec.LineSentence(filename)
        return Word2Vec(data, size=self._embedding_size, window=self._window_size, min_count=5, workers=multiprocessing.cpu_count())



def main():

    kmer2vec = Kmer2vec(embedding_size=256, batch_size=64, learningRate=1, window_size=4)

    logs_file = kmer2vec.openLogs()

    kmer2vec.setup()
    # kmer2vec.train(epochs=50000)

    print("\n\n\nnumber of cpus: {}".format(mp.cpu_count()))
    logs_file.write("\n\n\nnumber of cpus: {}".format(mp.cpu_count()))

    print('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)
    logs_file.write('\nkmer size (vocabulary = unique words): %d\n' % kmer2vec._kmers_size)

    print('length of data: %d\n' % len(kmer2vec._data))
    logs_file.write('length of data: %d' % len(kmer2vec._data))

    print('\n\ntraining is done!, and model is saved.\n')
    logs_file.write('\n\ntraining is done!, and model is saved.\n')
    
    kmer2vec.closeLogs()

if __name__ == "__main__":
    main()