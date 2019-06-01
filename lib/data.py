import os
import json
import collections
import random
import numpy as np


class Data(object):

    """data class to create the data folder."""


    def __init__(self, k=6):

        self._sequences = []
        self._data = []
        self._k = k
        self._kmer2int = {}
        self._int2kmer = {}
        self._kmers = []
        self._kmers_size = 0
        self._corpus = []
        self._sigma70 = {}
        self._dir_path = os.path.dirname(os.path.realpath(__file__))


    def setup(self):

        self._sigma70 = json.load(open(self._dir_path + '/data/sigma70.json'))
        self._sigma70 = self._sigma70[:int(0.9 * len(self._sigma70))]
        self._sequences = [promoter['PROMOTER_SEQUENCE'] for promoter in self._sigma70] 

        # shuffle then split the data into training and testing sets
        random.seed(230)

        for _ in range(5):
            random.shuffle(self._sequences)

        print("\n\ndata is setup")


    def kmer2int(self, kmer):
        return self._kmer2int[kmer]


    def int2kmer(self, index):
        return self._int2kmer[index]


    def __generateKmers(self, sequence):

        sequence_kmers = []
        num_kmers = len(sequence) - self._k + 1

        for i in range(num_kmers):

            kmer = sequence[i : i + self._k]
            sequence_kmers.append(kmer)

            self._kmers.append(kmer)

        self._kmers_size = len( set(self._kmers) )
        self._corpus.append(sequence_kmers)

        del sequence_kmers, num_kmers

    def __generateCorpus(self):

        for sequence in self._sequences:
            self._Data__generateKmers(sequence)
        print("kmers and corpus are created")


    def generateData(self):

        self._Data__generateCorpus()

        indexes = list(range(0, self._kmers_size))
        random.shuffle(indexes)

        index = 0
        currentKmers = []

        for _, kmer in enumerate(self._kmers):
            
            if kmer not in currentKmers:

                currentKmers.append(kmer)
                self._kmer2int[kmer] = indexes[index]
                self._int2kmer[ indexes[index] ] = kmer

                index += 1

            self._data.append(self._kmer2int[kmer])

        del currentKmers, index, indexes
        print("data is generated")


    def saveData(self):

        if not os.path.exists(self._dir_path+'/data'): 
            os.mkdir(self._dir_path+'/data')

        with open(self._dir_path+'/data/sequences.json', 'w') as filename: json.dump(self._sequences, filename, indent=4)
        with open(self._dir_path+'/data/int2kmer.json', 'w') as filename: json.dump(self._int2kmer, filename, indent=4)
        with open(self._dir_path+'/data/kmer2int.json', 'w') as filename: json.dump(self._kmer2int, filename, indent=4)
        with open(self._dir_path+'/data/corpus.json', 'w') as filename: json.dump(self._corpus, filename, indent=4)
        with open(self._dir_path+'/data/data.json', 'w') as filename: json.dump(self._data, filename, indent=4)
        with open(self._dir_path+'/data/kmers.json', 'w') as filename: json.dump(self._kmers, filename, indent=4)

        print("data folder is created")


def main():

    data = Data(k=6)

    data.setup()
    data.generateData()
    data.saveData()


if __name__ == "__main__":
    main()
    print("data is ready to be used in kmer2vec.py\n\n")