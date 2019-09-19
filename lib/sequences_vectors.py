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
        self._vectors = []
        self._sequence_coords = dict()
        self._sequence_coords['sequences'] = []
        self._sequence_vectors = dict()
        self._sequence_vectors['vectors'] = {}
        self._kmer_vectors = []
        self._embedding_size = embedding_size
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


    def setup(self):

        self._corpus = json.load(open(self._dir_path + '/data/corpus.json'))
        self._sequences = json.load(open(self._dir_path + '/data/sequences.json'))
        self._kmer_vectors = json.load(open(self._dir_path + '/data/kmer_Vectors.json'))['vectors']
        self._sigma70 = json.load(open(self._dir_path + '/data/sigma70.json'))

        print("\n\nsetup data")


    def avg_sequence_vector(self, kmers):

        sequence_vec = np.zeros((self._embedding_size, ), dtype='float32')
        
        for kmer in kmers:
            sequence_vec = np.add(sequence_vec, self._kmer_vectors[kmer])

        sequence_vec = np.divide(sequence_vec, len(kmers))

        return sequence_vec


    def calculate_coords(self):

        tsne_model = TSNE(perplexity=40, n_components=2, init='pca', n_iter=2500, random_state=23)
        new_values = tsne_model.fit_transform(self._vectors)

        for i, value in enumerate(new_values):
            row = {
                "promoter_id": self._sigma70[i]['PROMOTER_ID'],
                "promoter_sequence": self._sigma70[i]['PROMOTER_SEQUENCE'],
                "x": float(value[0]),
                "y": float(value[1]),
                "mean": np.mean(self._vectors[i])
            }
            self._sequence_coords['sequences'].append(row)

        print("calculateing x, and y coordinates")


    def calculate_vectors(self):

        for i in range(len(self._sigma70)):
            vector = self.avg_sequence_vector(self._corpus[i])
            self._vectors.append(vector)

            if (self._sigma70[i]['PROMOTER_SEQUENCE'] == self._sequences[i]):
                promoter_id = self._sigma70[i]['PROMOTER_ID']
                self._sequence_vectors['vectors'].update( {promoter_id: vector.tolist()} )

        print("vectors are calculated")


    def saveData(self):

        if not os.path.exists(self._dir_path+'/data'): 
            os.mkdir(self._dir_path+'/data')

        with open(self._dir_path+'/data/sequence_vectors.json', 'w') as filename: 
            json.dump(self._sequence_vectors, filename, indent=4)
        with open(self._dir_path+'/data/sequence_coords.json', 'w') as filename: 
            json.dump(self._sequence_coords, filename, indent=4)

        print("sequence_coords.json is created")
        print("sequence_vectors.json is created")


def main():

    seq2vec = Seq2Vec(embedding_size=256)

    seq2vec.setup()
    seq2vec.calculate_vectors()
    seq2vec.calculate_coords()
    seq2vec.saveData()


if __name__ == "__main__":
    main()
    print("promoter sequences' vectors are initialied\n\n")