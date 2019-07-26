import os
import json
import sys
import collections
import random
from sklearn.manifold import TSNE

import numpy as np
np.set_printoptions(threshold=sys.maxsize)

class Seq2Vec(object):

    """Seq2Vec find the average vector for promoter sequences."""


    def __init__(self, embedding_size):

        self._corpus = []
        self._sequences = []
        self._sigma70 = []
        self._sequences_vectors = dict()
        self._sequences_vectors['vectors'] = {}
        self._kmer_vectors = []
        self._embedding_size = embedding_size
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


    def setup(self):

        self._corpus = json.load(open(self._dir_path + '/data/corpus.json'))
        self._sequences = json.load(open(self._dir_path + '/data/sequences.json'))
        self._kmer_vectors = json.load(open(self._dir_path + '/data/kmer_Vectors.json'))['vectors']
        self._sigma70 = json.load(open(self._dir_path + '/data/sigma70.json'))


    def avg_sequence_vector(self, kmers):

        sequence_vec = np.zeros((self._embedding_size, ), dtype='float32')
        
        for kmer in kmers:
            sequence_vec = np.add(sequence_vec, self._kmer_vectors[kmer])

        sequence_vec = np.divide(sequence_vec, len(kmers))

        return sequence_vec


    def calculate_vectors(self):

        for i in range(len(self._sequences)):

            vector = self.avg_sequence_vector(self._corpus[i])

            for j in range(len(self._sigma70)):
                if (self._sigma70[j]['PROMOTER_SEQUENCE'] == self._sequences[i]):
                    promoter_id = self._sigma70[j]['PROMOTER_ID']
                    self._sequences_vectors['vectors'].update( {promoter_id: vector.tolist()} )


    def saveData(self):

        if not os.path.exists(self._dir_path+'/data'): 
            os.mkdir(self._dir_path+'/data')

        with open(self._dir_path+'/data/sequence_vectors.json', 'w') as filename: 
            json.dump(self._sequences_vectors, filename, indent=4)

        print("sequences_vectors.json is created")


def main():

    seq2vec = Seq2Vec(embedding_size=256)

    seq2vec.setup()
    seq2vec.calculate_vectors()
    seq2vec.saveData()


if __name__ == "__main__":
    main()
    print("promoter sequences' vectors are initialied\n\n")